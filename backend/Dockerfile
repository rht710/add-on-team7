FROM python:3.11-slim

# Set working directory
WORKDIR /code

# Copy requirements first to leverage Docker cache
COPY ./requirements.txt /code/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the rest of the backend files
COPY . /code

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Command to run uvicorn on Hugging Face port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
