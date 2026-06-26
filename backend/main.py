import os
import shutil
import tempfile
import re
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend_service import KnowledgeBaseManager, DocumentProcessor
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

app = FastAPI(
    title="Campus & Career Assistant Backend",
    description="Unified API powering RAG, Job Search Agents, and Interview Prep.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
STATIC_KB_DIR = os.path.join(BASE_DIR, "knowledge_base")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(STATIC_KB_DIR, exist_ok=True)

# Initialize KB Manager
kb = KnowledgeBaseManager()

# Pre-load files from the static knowledge_base folder on startup
@app.on_event("startup")
def load_static_kb():
    print("Loading pre-stored college documents...")
    if os.path.exists(STATIC_KB_DIR):
        for filename in os.listdir(STATIC_KB_DIR):
            file_path = os.path.join(STATIC_KB_DIR, filename)
            if os.path.isfile(file_path):
                try:
                    kb.add_document(file_path)
                except Exception as e:
                    print(f"Error loading {filename} during startup: {e}")

# Helper to verify API keys
def get_api_keys():
    openai_key = os.getenv("OPENAI_API_KEY")
    tavily_key = os.getenv("TAVILY_API_KEY")
    serper_key = os.getenv("SERPER_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    
    # We require at least one LLM key (OpenAI or Groq)
    has_openai = openai_key and not openai_key.startswith("your_openai_api_key_here")
    has_groq = groq_key and not groq_key.startswith("your_groq_api_key_here")
    
    if not has_openai and not has_groq:
        raise HTTPException(
            status_code=401,
            detail="Both OpenAI API Key and Groq API Key are missing or placeholder. Please check your .env file."
        )
        
    return {
        "openai_key": openai_key if has_openai else None,
        "tavily_key": tavily_key,
        "serper_key": serper_key,
        "groq_key": groq_key if has_groq else None
    }

# ================= COLLEGE ASSISTANT ENDPOINTS =================

class QueryRequest(BaseModel):
    question: str

@app.post("/api/college/query")
async def query_college(request: QueryRequest, keys: dict = Depends(get_api_keys)):
    try:
        result = kb.query_with_llm(
            request.question,
            openai_api_key=keys["openai_key"],
            groq_api_key=keys["groq_key"]
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/college/upload")
async def upload_college_doc(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Use PDF, DOCX, or TXT.")
        
    file_path = os.path.join(STATIC_KB_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Add to FAISS index
        kb.add_document(file_path)
        return {"status": "success", "message": f"Successfully indexed {file.filename}"}
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/college/indexed-files")
async def get_indexed_files():
    unique_sources = list(set([m["source"] for m in kb.metadata]))
    return {"indexed_files": unique_sources}


# ================= JOB ASSISTANT ENDPOINTS =================

from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from tavily import TavilyClient
from deepagents import create_deep_agent
from langchain_core.tools import tool

@tool
def internet_search(
    query: str,
    max_results: int = 5,
) -> List[Dict[str, Any]]:
    """Search the internet for current job postings using Tavily (primary) or Serper (fallback)."""
    tavily_key = os.environ.get("TAVILY_API_KEY", "")
    serper_key = os.environ.get("SERPER_API_KEY", "")

    # Try Tavily first
    if tavily_key:
        try:
            print("Attempting search using Tavily...")
            client = TavilyClient(api_key=tavily_key)
            results = client.search(query=query, max_results=max_results)
            if isinstance(results, dict) and "results" in results:
                formatted = []
                for r in results["results"]:
                    formatted.append({
                        "title": r.get("title", ""),
                        "url": r.get("url", ""),
                        "content": r.get("content", "")
                    })
                return formatted
            elif isinstance(results, list):
                return results
            else:
                return [results]
        except Exception as e:
            print(f"Tavily search failed: {e}. Falling back to Serper if available...")
            if not serper_key:
                raise e

    # Fallback to Serper
    if serper_key:
        try:
            print("Attempting search using Serper...")
            import requests
            headers = {
                "X-API-KEY": serper_key,
                "Content-Type": "application/json"
            }
            payload = {
                "q": query,
                "num": max_results
            }
            response = requests.post(
                "https://google.serper.dev/search",
                headers=headers,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            organic = data.get("organic", [])
            formatted = []
            for item in organic:
                formatted.append({
                    "title": item.get("title", ""),
                    "url": item.get("link", ""),
                    "content": item.get("snippet", "")
                })
            return formatted
        except Exception as e:
            print(f"Serper search failed: {e}")
            raise e

    raise RuntimeError("Neither TAVILY_API_KEY nor SERPER_API_KEY is configured.")

# Agent Prompts
INSTRUCTIONS = (
    "You are a job application assistant. Do two things:\n"
    "1) Use the web search tool to find exactly 3-5 CURRENT job postings (matching the user's target title, locations, and skills). "
    "Return them ONLY as JSON in this exact wrapper:\n"
    "<JOBS>\n"
    "[{\"company\":\"...\",\"title\":\"...\",\"location\":\"...\",\"link\":\"https://...\",\"Good Match\":\"one sentence why it is a good fit\"}, ...]\n"
    "</JOBS>\n"
    "Rules: The list must be valid JSON (no comments), real links to the job page, no duplicates.\n"
    "2) Produce a concise cover letter (≤150 words) for EACH job, with a subject line, appended to cover_letters.md under a heading per job.\n"
    "Do not invent jobs. Prefer reputable sources."
)

JOB_SEARCH_PROMPT = (
    "Search and select 3-5 real postings that match the user's title, locations, and skills. "
    "Output ONLY this block format (no extra text before/after the wrapper):\n"
    "<JOBS>\n"
    "[{\"company\":\"...\",\"title\":\"...\",\"location\":\"...\",\"link\":\"https://...\",\"Good Match\":\"one sentence\"}, ...]"
    "\n</JOBS>"
)

COVER_LETTER_PROMPT = (
    "For each job in the found list, write a subject line and a concise cover letter (≤150 words) that ties the user's skills/resume to the role. "
    "Append to cover_letters.md under a heading per job. Keep writing tight and specific."
)

@app.post("/api/job/analyze")
async def analyze_job_profile(
    file: UploadFile = File(...),
    target_title: str = Form("AI Engineer"),
    target_location: str = Form("Remote"),
    skills_hint: str = Form(""),
    keys: dict = Depends(get_api_keys)
):
    # Setup keys
    if keys["openai_key"]:
        os.environ["OPENAI_API_KEY"] = keys["openai_key"]
    if keys["tavily_key"]:
        os.environ["TAVILY_API_KEY"] = keys["tavily_key"]
    if keys.get("serper_key"):
        os.environ["SERPER_API_KEY"] = keys["serper_key"]

    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract Resume text
        resume_text = DocumentProcessor.extract_text(file_path)
        
        # We also need to analyze the resume (ATS score, Feedback, Roles matching)
        # We'll try OpenAI first, and fallback to Groq if it fails
        analysis_data = None
        last_error = None
        
        analysis_prompt = (
            "You are an expert resume ATS parser and career advisor.\n"
            "Analyze the following resume text. Provide:\n"
            "1. An overall ATS score percentage (0-100) representing compatibility with a typical modern ATS system.\n"
            "2. Three bullet points of resume feedback/analysis (e.g. strengths and improvements).\n"
            "3. Three matching roles with match percentages based on the resume content.\n\n"
            "Output the results ONLY as a JSON object with this exact structure:\n"
            "{\n"
            "  \"ats_score\": 85,\n"
            "  \"feedback\": [\"✅ Strong technical section\", \"✅ Clear project details\", \"⚠ Quantify achievements\"],\n"
            "  \"recommended_roles\": [\n"
            "    {\"role\": \"AI Engineer\", \"match\": 92},\n"
            "    {\"role\": \"Data Analyst\", \"match\": 88},\n"
            "    {\"role\": \"ML Intern\", \"match\": 84}\n"
            "  ]\n"
            "}\n\n"
            f"RESUME TEXT:\n{resume_text[:6000]}"
        )
        
        # Track which LLM successfully worked for resume analysis
        working_llm_type = None

        from openai import OpenAI
        if keys["openai_key"]:
            try:
                client = OpenAI(api_key=keys["openai_key"])
                analysis_res = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": analysis_prompt}],
                    temperature=0.3,
                    response_format={"type": "json_object"}
                )
                analysis_data = json.loads(analysis_res.choices[0].message.content)
                working_llm_type = "openai"
            except Exception as e:
                print(f"OpenAI resume analysis failed: {e}. Trying Groq...")
                last_error = e

        if analysis_data is None and keys["groq_key"]:
            try:
                client = OpenAI(api_key=keys["groq_key"], base_url="https://api.groq.com/openai/v1")
                analysis_res = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": analysis_prompt}],
                    temperature=0.3,
                    response_format={"type": "json_object"}
                )
                analysis_data = json.loads(analysis_res.choices[0].message.content)
                working_llm_type = "groq"
            except Exception as e:
                print(f"Groq resume analysis failed: {e}")
                last_error = e

        if analysis_data is None:
            raise Exception(f"Failed to perform resume analysis. Both LLM clients failed or were not configured. Last error: {last_error}")
        
        # If Tavily or Serper is set, run search directly and use LLM to synthesize the results.
        jobs_list = []
        cover_letters = "Tavily or Serper API Key is required to fetch real job listings and generate cover letters."
        
        if keys["tavily_key"] or keys.get("serper_key"):
            search_query = f"{target_title} jobs in {target_location}"
            if skills_hint:
                search_query += f" {skills_hint}"
                
            try:
                search_results = internet_search.func(query=search_query, max_results=8)
            except Exception as se:
                print(f"Direct internet search failed: {se}")
                search_results = []
                
            agent_prompt = (
                "You are an expert job assistant.\n"
                "Given the following candidate resume text and a list of job search results, select the best 3-5 matching jobs.\n"
                "For each selected job, write:\n"
                "1. A justification for why it matches the candidate (one sentence for 'Good Match').\n"
                "2. A concise cover letter (≤150 words) that ties the user's skills/resume to the role.\n\n"
                "Output the results ONLY as a JSON object with this exact structure:\n"
                "{\n"
                "  \"jobs\": [\n"
                "    {\n"
                "      \"company\": \"Company Name\",\n"
                "      \"title\": \"Job Title\",\n"
                "      \"location\": \"Location\",\n"
                "      \"link\": \"https://...\",\n"
                "      \"Good Match\": \"One sentence why it is a good fit.\"\n"
                "    }\n"
                "  ],\n"
                "  \"cover_letters\": \"# Job Title at Company Name\\n\\nDear Hiring Manager,...\\n\\n# Job Title 2 at Company 2...\"\n"
                "}\n\n"
                f"CANDIDATE RESUME TEXT:\n{resume_text[:6000]}\n\n"
                f"JOB SEARCH RESULTS:\n{json.dumps(search_results)}"
            )
            
            agent_data = None
            if working_llm_type == "openai":
                try:
                    client = OpenAI(api_key=keys["openai_key"])
                    agent_res = client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[{"role": "user", "content": agent_prompt}],
                        temperature=0.3,
                        response_format={"type": "json_object"}
                    )
                    agent_data = json.loads(agent_res.choices[0].message.content)
                except Exception as ae:
                    print(f"OpenAI job/cover letter synthesis failed: {ae}")
            
            if agent_data is None and (working_llm_type == "groq" or keys["groq_key"]):
                try:
                    client = OpenAI(api_key=keys["groq_key"], base_url="https://api.groq.com/openai/v1")
                    agent_res = client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[{"role": "user", "content": agent_prompt}],
                        temperature=0.3,
                        response_format={"type": "json_object"}
                    )
                    agent_data = json.loads(agent_res.choices[0].message.content)
                except Exception as ae:
                    print(f"Groq job/cover letter synthesis failed: {ae}")
                    
            if agent_data:
                jobs_list = agent_data.get("jobs", [])
                cover_letters = agent_data.get("cover_letters", "")
                    
        # Construct final output
        return {
            "ats_score": analysis_data.get("ats_score", 75),
            "feedback": analysis_data.get("feedback", []),
            "recommended_roles": analysis_data.get("recommended_roles", []),
            "jobs": jobs_list,
            "cover_letters": cover_letters
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)


# ================= INTERVIEW PREP ENDPOINTS =================

class InterviewRequest(BaseModel):
    role: str

@app.post("/api/interview/questions")
async def generate_interview_questions(request: InterviewRequest, keys: dict = Depends(get_api_keys)):
    try:
        prompt = (
            f"You are a Senior Technical Interviewer. Generate exactly 3-5 realistic technical interview questions "
            f"for the role of: {request.role}. Keep each question professional, clear, and relevant to modern industry standards."
            f"Output the results ONLY as a JSON list of strings."
        )
        
        response = None
        last_error = None
        from openai import OpenAI

        if keys["openai_key"]:
            try:
                client = OpenAI(api_key=keys["openai_key"])
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
            except Exception as e:
                print(f"OpenAI interview prep failed: {e}. Trying Groq...")
                last_error = e

        if response is None and keys["groq_key"]:
            try:
                client = OpenAI(api_key=keys["groq_key"], base_url="https://api.groq.com/openai/v1")
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
            except Exception as e:
                print(f"Groq interview prep failed: {e}")
                last_error = e

        if response is None:
            raise Exception(f"Failed to generate questions. Both LLMs failed or were not configured. Last error: {last_error}")
            
        data = json.loads(response.choices[0].message.content)
        questions = data.get("questions", data.get("interview_questions", list(data.values())[0]))
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/college/scrape-updates")
async def scrape_college_updates(college_name: str, keys: dict = Depends(get_api_keys)):
    # Setup keys
    if keys["openai_key"]:
        os.environ["OPENAI_API_KEY"] = keys["openai_key"]
    if keys["tavily_key"]:
        os.environ["TAVILY_API_KEY"] = keys["tavily_key"]
    if keys.get("serper_key"):
        os.environ["SERPER_API_KEY"] = keys["serper_key"]

    # Detect if input is a website URL or domain
    query_str = college_name.strip()
    is_site_search = False
    target_display_name = college_name
    
    domain_match = re.search(r"(?:https?://)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)", query_str)
    if domain_match:
        domain = domain_match.group(1)
        # Check if it has a typical education/organization domain suffix
        if any(ext in domain for ext in [".edu", ".ac", ".org", ".co", ".in", ".us"]):
            is_site_search = True
            target_display_name = domain

    # We perform two separate targeted searches: one for placement info, one for fests/events
    results_placements = []
    results_events = []
    
    if is_site_search:
        query_placements = f"site:{domain} placements OR placement OR hiring OR recruitment OR job"
        query_events = f"site:{domain} fests OR fest OR events OR event OR news OR circulars OR calendar"
    else:
        query_placements = f"{college_name} placements hiring drives recruitment 2025 2026"
        query_events = f"{college_name} fests events news academic calendar 2025 2026"

    try:
        print(f"Scraping placements query: {query_placements}")
        results_placements = internet_search.func(query=query_placements, max_results=5)
    except Exception as se:
        print(f"Scraper placement search failed: {se}")

    try:
        print(f"Scraping events query: {query_events}")
        results_events = internet_search.func(query=query_events, max_results=5)
    except Exception as ee:
        print(f"Scraper events search failed: {ee}")

    # Merge and deduplicate by URL
    seen_urls = set()
    search_results = []
    for r in (results_placements + results_events):
        url = r.get("url")
        if url and url not in seen_urls:
            seen_urls.add(url)
            search_results.append(r)

    # Fallback to general search if site search returned no results or very few results
    if len(search_results) < 2:
        print("Scraper returned insufficient results. Falling back to general search...")
        fallback_query = f"{target_display_name} college placements fests events calendar 2025 2026"
        try:
            search_results = internet_search.func(query=fallback_query, max_results=8)
        except Exception as fe:
            print(f"Scraper fallback search failed: {fe}")

    prompt = (
        "You are an expert academic advisor.\n"
        f"Based on the following search results for '{target_display_name}', extract:\n"
        "1. Three realistic/recent placement updates (company name, roles, status: 'Active', 'Upcoming', or 'Closed').\n"
        "2. Three upcoming events or academic calendar deadlines (month name, day number, title, description).\n"
        "3. Overall college statistics if found in the text: Estimated count of Active/recruiting Companies in the recent season (e.g., '45+', '120+') and Average CTC in LPA as a float/string (e.g., '8.5', '12.4'). If not found, make a realistic estimate based on the college stature.\n\n"
        "Output the results ONLY as a JSON object with this exact structure:\n"
        "{\n"
        "  \"placements\": [\n"
        "    {\"title\": \"Google Internship Drive\", \"description\": \"Software Engineering & AI Internships\", \"status\": \"Active\"},\n"
        "    {\"title\": \"Microsoft Hiring Event\", \"description\": \"ML & Full Stack Engineering Roles\", \"status\": \"Upcoming\"},\n"
        "    {\"title\": \"Amazon Campus Recruitment\", \"description\": \"Cloud Support & Operations Engineers\", \"status\": \"Closed\"}\n"
        "  ],\n"
        "  \"events\": [\n"
        "    {\"month\": \"Aug\", \"day\": \"24\", \"title\": \"Fall Semester Starts\", \"description\": \"Orientation and commencement of regular classes\"},\n"
        "    {\"month\": \"Oct\", \"day\": \"12\", \"title\": \"Mid-Term Examinations\", \"description\": \"Running from Oct 12 to Oct 16 across all branches\"},\n"
        "    {\"month\": \"Dec\", \"day\": \"07\", \"title\": \"Final Semester Examinations\", \"description\": \"End-semester theory and practical exams\"}\n"
        "  ],\n"
        "  \"active_companies\": \"45+\",\n"
        "  \"average_ctc\": \"8.5\"\n"
        "}\n\n"
        f"SEARCH RESULTS:\n{json.dumps(search_results)}"
    )

    response = None
    last_error = None
    from openai import OpenAI

    if keys["openai_key"]:
        try:
            client = OpenAI(api_key=keys["openai_key"])
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
        except Exception as e:
            print(f"OpenAI scrape failed: {e}. Trying Groq...")
            last_error = e

    if response is None and keys["groq_key"]:
        try:
            client = OpenAI(api_key=keys["groq_key"], base_url="https://api.groq.com/openai/v1")
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
        except Exception as e:
            print(f"Groq scrape failed: {e}")
            last_error = e

    # Extract unique source URLs from the search results
    search_urls = list(set([res["url"] for res in search_results if res.get("url")]))

    if response is None:
        fallback_data = {
            "placements": [
                {"title": f"Google Drive ({target_display_name})", "description": "SWE & AI Internships", "status": "Active"},
                {"title": f"Microsoft Event ({target_display_name})", "description": "ML & Full Stack Engineering Roles", "status": "Upcoming"},
                {"title": f"Amazon Recruitment ({target_display_name})", "description": "Cloud Support & Operations Engineers", "status": "Closed"}
            ],
            "events": [
                {"month": "Aug", "day": "24", "title": "Fall Semester COMMENCEMENT", "description": "Orientation and classes begin"},
                {"month": "Oct", "day": "12", "title": "Mid-Term Examinations", "description": "Running across all branches"},
                {"month": "Dec", "day": "07", "title": "Final Examinations", "description": "End-semester theory exams"}
            ],
            "active_companies": "45+",
            "average_ctc": "8.5",
            "sources": []
        }
        kb.set_scraped_context(target_display_name, fallback_data)
        return fallback_data

    try:
        data = json.loads(response.choices[0].message.content)
        # Attach the scraped source URLs for verification
        data["sources"] = search_urls
        if "active_companies" not in data:
            data["active_companies"] = "45+"
        if "average_ctc" not in data:
            data["average_ctc"] = "8.5"
        
        # Save to RAG context
        kb.set_scraped_context(target_display_name, data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse LLM response: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
