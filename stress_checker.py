import requests

def get_user_input():
    print("Enter your health data to check stress level:")
    bmi = float(input("BMI: "))
    resting_hr_bpm = float(input("Resting Heart Rate (BPM): "))
    spo2_avg_pct = float(input("SpO2 Average (%): "))
    sleep_duration_hours = float(input("Sleep Duration (hours): "))
    mood = int(input("Mood (1-5 scale): "))
    working_hours = float(input("Working Hours per day: "))
    screen_time = float(input("Screen Time per day (hours): "))

    return {
        "bmi": bmi,
        "resting_hr_bpm": resting_hr_bpm,
        "spo2_avg_pct": spo2_avg_pct,
        "sleep_duration_hours": sleep_duration_hours,
        "mood": mood,
        "working_hours": working_hours,
        "screen_time": screen_time
    }

def main():
    data = get_user_input()

    url = "http://127.0.0.1:8000/predict"

    try:
        response = requests.post(url, json=data)
        response.raise_for_status()  # Raise an error for bad status codes

        result = response.json()
        print("\n--- Stress Assessment Result ---")
        print(f"Stress Level: {result['stress_level']}")
        print(f"Summary: {result['summary']}")
        print("\nFactors:")
        for factor in result['factors']:
            print(f"- {factor}")
        print("\nRecommendations:")
        for rec in result['recommendations']:
            print(f"- {rec}")

    except requests.exceptions.RequestException as e:
        print(f"Error connecting to the server: {e}")
        print("Make sure the FastAPI server is running (uvicorn main:app --reload in backend directory)")

if __name__ == "__main__":
    main()