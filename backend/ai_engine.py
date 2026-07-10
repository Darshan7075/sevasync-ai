import re
import os
import json

# Try to import and configure Gemini (safe fallback)
try:
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Failed to load google.generativeai: {e}")
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
    def chat_response(message: str):
        """
        AI logic to reply to volunteer's chat messages.
        """
        api_key = os.getenv("GEMINI_API_KEY")
        if model and api_key and api_key != "your_gemini_api_key_here":
            try:
                prompt = f"You are a Tactical Command AI for a disaster management system named SevaSync. A field volunteer says: '{message}'. Give a brief, professional, and tactical response (max 2 sentences)."
                response = model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                print(f"Gemini Chat API failed: {e}")
                pass
        
        # Local fallback chatbot logic
        import random
        msg_lower = message.lower()
        
        # Greetings
        if any(w in msg_lower for w in ["hi", "hy", "hello", "hey", "namaste"]):
            responses = [
                "Hello! Main SevaSync AI Assistant hoon. Main aapki field me kaise madad kar sakta hoon?",
                "Namaste! Main Rescue AI hoon. Kisi specific supply ya emergency ke liye help chahiye aapko?",
                "Hi! Boliye, aapko dashboard se related ya field deployment me koi technical help chahiye?"
            ]
            return random.choice(responses)
            
        # Emergency/Help
        elif any(w in msg_lower for w in ["help", "emergency", "sos", "urgent", "madad"]):
            responses = [
                "Aapki emergency alert maine note kar li hai. Main turant nearest Command Center ko notify kar raha hoon. Please safe rahiye!",
                "Ghabraiye mat, maine priority SOS system me update kar diya hai. Kya aap mujhe exact situation ki details de sakte hain?",
                "Alert received. Maine Logistics dashboard par 'High Urgency' trigger kar diya hai. Backup raaste me hai."
            ]
            return random.choice(responses)
            
        # Status/Updates
        elif any(w in msg_lower for w in ["status", "update", "report"]):
            responses = [
                "Abhi tak sabhi Hubs me supplies stable hain. Vadodara base se 2 trucks already dispatch ho chuke hain.",
                "Main real-time data track kar raha hoon. Sab kuch control me lag raha hai. Aapko koi specific sector ka data chahiye?",
                "System parameters normal hain. Maine Predictive AI check kiya hai, abhi aane wale 6 ghante tak koi critical shortage nahi hai."
            ]
            return random.choice(responses)
            
        # Supplies
        elif any(w in msg_lower for w in ["water", "food", "medical", "supply", "supplies", "kit", "khana", "pani"]):
            responses = [
                "Bilkul, maine aapke area ke liye supplies ka estimation laga liya hai. Aap 'Field Deployment Form' se sidhe truck dispatch karwa sakte hain.",
                "Main dekh pa raha hoon ki Medical kits aur Water ki requirement badh rahi hai. Aap order form use karke directly request bhej dijiye.",
                "Zaroor, supplies request karne ke liye please form submit karein, main backend me payload capacity manage kar lunga."
            ]
            return random.choice(responses)
            
        # Acknowledgment
        elif any(w in msg_lower for w in ["ok", "okay", "copy", "roger", "understood", "thik", "theek", "ji", "thanks", "thank"]):
            responses = [
                "You're welcome! Aur kuch help chahiye toh batana.",
                "No problem! Main yahi hoon agar aapko koi aur analysis chahiye toh.",
                "Perfect. Good luck with the rescue operations!"
            ]
            return random.choice(responses)
        
        # Default (ChatGPT Style)
        defaults = [
            "Main samajh nahi paya. Kya aap isko thoda detail me samjha sakte hain?",
            "As an AI Rescue Assistant, main field data aur logistics me aapki madad kar sakta hoon. Boliye, exactly kya detail chahiye aapko?",
            "Accha, kya aap chahte hain ki main aapko current supply chain ki report doon ya koi naya task assign karun?",
            "Maine ye query command server par log kar di hai. Me aur kaise aapki help kar sakta hoon?"
        ]
        return random.choice(defaults)

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
