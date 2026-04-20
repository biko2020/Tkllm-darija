
import sys
import json
import argparse
from pathlib import Path
from model_cache import model_cache

try:
    from faster_whisper import WhisperModel
except ImportError:
    print(json.dumps({"error": "faster-whisper not installed"}))
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Whisper ASR Inference")
    parser.add_argument("--model", default="small", choices=["small", "large-v3"])
    parser.add_argument("--audio", required=True, help="Path to audio file")
    parser.add_argument("--language", default="ar", help="Language code (ar for Darija)")
    parser.add_argument("--device", default="auto", choices=["auto", "cuda", "cpu"])
    parser.add_argument("--compute_type", default="auto")
    args = parser.parse_args()

    try:
        # Load model (cached after first use)
        model = WhisperModel(
            args.model,
            device=args.device,
            compute_type=args.compute_type,
        )

        # Use cached model instead of loading every time
        model = model_cache.get_model(
            model_name=args.model,
            device=args.device,
            compute_type=args.compute_type
        )
        # Transcribe
        segments, info = model.transcribe(
            args.audio,
            language=args.language if args.language != "auto" else None,
            beam_size=5,
            word_timestamps=True,
            vad_filter=True,
        )

        # Build result
        result = {
            "text": " ".join(segment.text for segment in segments),
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration,
            "segments": [
                {
                    "start": segment.start,
                    "end": segment.end,
                    "text": segment.text.strip(),
                    "confidence": segment.avg_logprob,
                }
                for segment in segments
            ]
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()