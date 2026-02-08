from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

class TaskInput(BaseModel):
    task_text: str

@app.get("/")
def read_root():
    return {"message": "AI Service is running"}

@app.post("/parse_task")
def parse_task(task_input: TaskInput):
    # Stub for NLP parsing
    return {
        "original_text": task_input.task_text,
        "parsed_task": {
            "title": task_input.task_text,
            "deadline": "2023-12-31T23:59:00",
            "priority": "medium"
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
