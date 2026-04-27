import re

class AIEngine:
    @staticmethod
    def calculate_urgency(description: str, people_affected: int):
        """
        AI logic to determine urgency based on keywords and scale.
        """
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
