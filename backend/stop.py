
import sys
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import os
import logging
import requests
import subprocess
from typing import Tuple, Optional
import dotenv

# Load environment variables
dotenv.load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

class StopAppResponse(BaseModel):
    status: str
    message: str
    app_name: str

@app.post("/stop-app/{app_name}", response_model=StopAppResponse)
async def stop_app_endpoint(app_name: str, request: Request):
    try:
        if not app_name:
            raise HTTPException(status_code=400, detail="app_name is required")

        # Get request body if any
        try:
            body = await request.json()
            error_message = body.get("error", "Unknown error")
            context = body.get("context", {})
            logger.info(f"Stopping app {app_name} due to error: {error_message}")
            logger.info(f"Context: {context}")
        except:
            pass

        # Set Modal credentials first
        token_id = os.getenv("MODAL_TOKEN_ID")
        token_secret = os.getenv("MODAL_TOKEN_SECRET")
        
        if not token_id or not token_secret:
            error_msg = "Modal credentials not found in environment variables"
            logger.error(f"Missing credentials - MODAL_TOKEN_ID: {'present' if token_id else 'missing'}, MODAL_TOKEN_SECRET: {'present' if token_secret else 'missing'}")
            raise HTTPException(status_code=500, detail=error_msg)

        # Set the credentials
        set_creds_command = f"modal token set --token-id {token_id} --token-secret {token_secret}"
        exit_code, stdout, stderr = run_command(set_creds_command)
        
        if exit_code != 0:
            error_msg = f"Failed to set Modal credentials: {stderr if stderr else 'Unknown error'}"
            raise HTTPException(status_code=500, detail=error_msg)

        # Stop the Modal app
        command = f"modal app stop {app_name}"
        exit_code, stdout, stderr = run_command(command)
        
        if exit_code != 0:
            error_msg = f"Failed to stop app: {stderr if stderr else 'Unknown error'}"
            raise HTTPException(status_code=500, detail=error_msg)

        return StopAppResponse(
            status="success",
            message="App stopped successfully",
            app_name=app_name
        )

    except Exception as e:
        logger.error(f"Error stopping app: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

def run_command(command: str, capture_output: bool = True) -> Tuple[int, Optional[str], Optional[str]]:
    try:
        if capture_output:
            result = subprocess.run(
                command,
                shell=True,
                text=True,
                capture_output=True,
                check=False
            )
            return result.returncode, result.stdout, result.stderr
        else:
            # Run command and let output go directly to terminal
            result = subprocess.run(
                command,
                shell=True,
                check=False
            )
            return result.returncode, None, None
    except subprocess.CalledProcessError as e:
        error_msg = f"Error running command: {e}"
        print(error_msg, file=sys.stderr)
        return e.returncode, None, str(e)
    except Exception as e:
        error_msg = f"Unexpected error running command: {e}"
        print(error_msg, file=sys.stderr)
        return -1, None, str(e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)
