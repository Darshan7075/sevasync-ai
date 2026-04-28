import re
import os
import json

# Try to import and configure Gemini (safe fallback)
try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')
except ImportError:
    model = None

class AIEngine:
    @staticmethod
    def calculate_urgency(description: str, people_affected: int):
        """
        AI logic to determine urgency based on keywords and scale.
        Uses Gemini API if available, else falls back to local logic.
        """
        api_key = os.getenv("GEMINI_API_KEY")
        
        if model and api_key and api_key != "your_gemini_api_key_here":
            try:
                # Use Gemini API for dynamic AI calculation
                prompt = f"""
Analyze this disaster/emergency report and determine the urgency.
Description: {description}
People Affected: {people_affected}

Respond ONLY in valid JSON format with exactly three keys:
- "level": string ("High", "Medium", or "Low")
- "score": integer (0 to 10)
- "explanation": string (1-2 short sentences explaining the priority level based on the description and people affected)
"""
                response = model.generate_content(prompt)
                
                # Extract JSON from response safely
                text = response.text
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].strip()
                    
                data = json.loads(text)
                
                level = data.get("level", "Medium")
                score = data.get("score", 5)
                explanation = "AI Analysis: " + data.get("explanation", "Based on automated analysis.")
                
                # Ensure score bounds
                score = min(max(int(score), 0), 10)
                
                return level, score, explanation
            except Exception as e:
                print(f"Gemini API calculation failed: {e}. Falling back to local logic...")
                pass # Fall through to local fallback logic

        # --- LOCAL FALLBACK LOGIC ---
        high_priority_keywords = ["emergency", "critical", "blood", "accident", "dying", "trapped", "fire", "starving"]
        medium_priority_keywords = ["food", "medical", "water", "shortage", "sick"]
        
        desc_lower = description.lower()
        score = 0
        
        # Keyword Analysis
        for word in high_priority_keywords:
            if word in desc_lower:
                score += 4
        
        for word in medium_priority_keywords:
            if word in desc_lower:
                score += 2
                
        # Scale Analysis
        if people_affected > 50:
            score += 4
        elif people_affected > 10:
            score += 2
            
        # Normalization (Max 10)
        score = min(score, 10)
        
        level = "Low"
        if score >= 8:
            level = "High"
        elif score >= 5:
            level = "Medium"
            
        # Explainable AI Reason
        reasons = []
        if any(w in desc_lower for w in high_priority_keywords):
            reasons.append("Critical keywords detected")
        if people_affected > 10:
            reasons.append(f"High impact ({people_affected} people affected)")
        
        explanation = "Priority marked because: " + ", ".join(reasons) if reasons else "Based on standard community report metrics."
        
        return level, score, explanation

    @staticmethod
    def detect_duplicates(new_report: str, existing_reports: list):
        """
        Simple fuzzy duplicate detection logic.
        """
        for report in existing_reports:
            # Overlap check
            words_new = set(re.findall(r'\w+', new_report.lower()))
            words_old = set(re.findall(r'\w+', report.description.lower()))
            intersection = words_new.intersection(words_old)
            if len(intersection) / max(len(words_new), 1) > 0.7:
                return True, report.id
        return False, None

    @staticmethod
    def match_volunteers(report, volunteers: list):
        """
        Matches volunteers based on skill and availability.
        """
        matches = []
        for v in volunteers:
            score = 0
            # Skill matching
            if v.skill.lower() in report.issue_type.lower():
                score += 5
            # Rating bonus
            score += v.rating
            
            matches.append({"volunteer": v, "match_score": score})
            
        # Sort by score
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches[:3] # Top 3 candidates
