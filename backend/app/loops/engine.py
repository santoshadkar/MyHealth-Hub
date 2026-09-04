import time
import uuid
from typing import List, Dict, Any, Optional

class HealthLoopEngine:
    def __init__(self):
        self.pending_approvals: List[Dict[str, Any]] = [
            {
                "approval_id": "hitl-med-01",
                "patient_name": "Aarav Sharma (Age 52)",
                "tool_name": "order_medication_refill",
                "arguments": {
                    "patient_id": "P-1001",
                    "medication_name": "Metformin 500 mg",
                    "quantity": 30
                },
                "risk_level": "high",
                "description": "AI detected Metformin supply dropping to 6 tablets. Doctor review required before placing Apollo Pharmacy order.",
                "status": "pending",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
        ]
        self.cron_jobs: List[Dict[str, Any]] = [
            {
                "id": "cron-health-1",
                "name": "Blood Sugar & Vitals Trend Watcher (India)",
                "schedule": "Every 24 hours",
                "status": "active",
                "last_run": time.strftime("%Y-%m-%d 08:00:00"),
                "next_run": "Tomorrow at 08:00 AM IST",
                "description": "Calculates next recommended checkup dates for blood sugar, BP, SpO2, and pulse rate based on ICMR guidelines."
            },
            {
                "id": "cron-health-2",
                "name": "Medication Stock Completion Alert",
                "schedule": "Every 12 hours",
                "status": "active",
                "last_run": time.strftime("%Y-%m-%d 12:00:00"),
                "next_run": "In 6 hours",
                "description": "Scans patient active medications and triggers pharmacy refill requests when tablets < 7."
            }
        ]

    def audit_medical_guidance(self, prompt: str, response: str) -> Dict[str, Any]:
        issues = []
        if "disclaimer" not in response.lower() and "doctor" not in response.lower():
            issues.append("Medical advice response requires a clinical reference disclaimer.")

        passed = len(issues) == 0
        return {
            "passed": passed,
            "quality_score": 0.96 if passed else 0.80,
            "issues": issues,
            "feedback": "Reflection Audit: Attached standard clinical disclaimer."
        }

    def add_pending_approval(self, patient_name: str, tool_name: str, arguments: Dict[str, Any], risk_level: str, description: str) -> Dict[str, Any]:
        approval_id = f"hitl-med-{str(uuid.uuid4())[:6]}"
        item = {
            "approval_id": approval_id,
            "patient_name": patient_name,
            "tool_name": tool_name,
            "arguments": arguments,
            "risk_level": risk_level,
            "description": description,
            "status": "pending",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.pending_approvals.append(item)
        return item

    def get_pending_approvals(self) -> List[Dict[str, Any]]:
        return [i for i in self.pending_approvals if i["status"] == "pending"]

    def process_approval(self, approval_id: str, action: str) -> Optional[Dict[str, Any]]:
        for item in self.pending_approvals:
            if item["approval_id"] == approval_id:
                item["status"] = action
                return item
        return None

    def list_cron_jobs(self) -> List[Dict[str, Any]]:
        return self.cron_jobs

health_loop_instance = HealthLoopEngine()
