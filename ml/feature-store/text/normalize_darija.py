"""
Darija Text Normalisation Pipeline
ml/feature-store/text/normalize_darija.py

Normalises Moroccan Darija text in both Arabic script and Arabizi (Latin).
Used to pre-process transcripts before WER computation, dataset export,
and text embedding.

Key challenges in Darija normalisation:
  - Mixed script (Arabic + Latin + digits)
  - Code-switching with French and Modern Standard Arabic
  - No standardised orthography
  - Regional spelling variants (casablanci, marrakchi, fassi)
  - Diacritics optionally present

Usage:
    from ml.feature_store.text.normalize_darija import DarijaNormalizer
    n = DarijaNormalizer()
    n.normalize("كيداير مع ليك؟")
    n.normalize("kifash ndir had chغaliya?")
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Callable


class Script(Enum):
    ARABIC  = auto()
    ARABIZI = auto()
    MIXED   = auto()
    UNKNOWN = auto()


# =============================================================================
# Script Detection
# =============================================================================

def detect_script(text: str) -> Script:
    """Detect the dominant script of a Darija text."""
    if not text.strip():
        return Script.UNKNOWN

    arabic_chars = sum(1 for c in text if "\u0600" <= c <= "\u06ff")
    latin_chars  = sum(1 for c in text if c.isascii() and c.isalpha())
    total        = arabic_chars + latin_chars

    if total == 0:
        return Script.UNKNOWN
    arabic_ratio = arabic_chars / total

    if arabic_ratio > 0.75:
        return Script.ARABIC
    elif arabic_ratio < 0.25:
        return Script.ARABIZI
    else:
        return Script.MIXED


# =============================================================================
# Arabic Script Normalisation
# =============================================================================

# Moroccan-specific Arabic character substitutions
ARABIC_SUBS: list[tuple[str, str]] = [
    # Alef variants → bare Alef
    (r"[أإآٱ]",          "ا"),
    # Tah Marbuta → Hah (Moroccan pronunciation)
    (r"ة",               "ه"),
    # Alef Maqsura → Ya
    (r"ى",               "ي"),
    # Waw with hamza → Waw
    (r"ؤ",               "و"),
    # Ya with hamza → Ya
    (r"ئ",               "ي"),
    # Remove Tatweel (Arabic letter extension)
    (r"\u0640",          ""),
    # Remove all diacritics (tashkeel)
    (r"[\u064b-\u065f\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed]", ""),
]

# Darija-specific word normalisation
ARABIC_WORD_MAP: dict[str, str] = {
    "هاد":  "هذا",
    "هادي": "هذه",
    "هادو": "هؤلاء",
    "فين":  "أين",
    "كيفاش": "كيف",
    "علاش": "لماذا",
    "واش":  "هل",
    "ماشي": "ليس",
    "بزاف": "كثيرا",
    "شوية": "قليلا",
    "دابا":  "الآن",
    "غادي": "سيذهب",
    "مزيان":"جيد",
    "كاين": "يوجد",
}


def normalise_arabic_script(text: str) -> str:
    """Normalise Arabic-script Darija text."""
    # Unicode NFC normalisation
    text = unicodedata.normalize("NFC", text)

    # Apply character substitutions
    for pattern, replacement in ARABIC_SUBS:
        text = re.sub(pattern, replacement, text)

    # Remove punctuation except spaces
    text = re.sub(r"[،,.؟?!؛;:\-–—()[\]{}\"\'«»/\\]", " ", text)

    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# =============================================================================
# Arabizi (Latin-script Darija) Normalisation
# =============================================================================

# Common Arabizi → normalised Arabizi substitutions
ARABIZI_SUBS: list[tuple[str, str]] = [
    # Number-letter substitutions
    (r"3",   "ع"),    # ain
    (r"7",   "ح"),    # ha
    (r"9",   "ق"),    # qaf
    (r"2",   "ء"),    # hamza
    (r"5",   "خ"),    # kha
    (r"8",   "غ"),    # ghain
    # Common Arabizi variant spellings
    (r"\bkifash\b",  "kifach"),
    (r"\bchouia\b",  "chwiya"),
    (r"\bbzaf\b",    "bezzaf"),
    (r"\bdaba\b",    "daba"),
    (r"\bwach\b",    "wach"),
    (r"\bmziane?\b", "mzyan"),
    (r"\bkayn\b",    "kayen"),
]

# Mixed Arabizi → Arabic transliteration map (partial)
ARABIZI_TO_ARABIC: dict[str, str] = {
    "w":   "و",  "y":   "ي",  "b":   "ب",  "t":  "ت",  "th": "ث",
    "j":   "ج",  "ch":  "ش",  "h":   "ه",  "kh": "خ",  "d":  "د",
    "r":   "ر",  "z":   "ز",  "s":   "س",  "sh": "ش",  "9":  "ق",
    "k":   "ك",  "l":   "ل",  "m":   "م",  "n":  "ن",  "a":  "ا",
    "e":   "ي",  "i":   "ي",  "o":   "و",  "u":  "و",  "gh": "غ",
    "3":   "ع",  "7":   "ح",  "f":   "ف",  "p":  "ب",  "q":  "ق",
}


def normalise_arabizi(text: str) -> str:
    """Normalise Latin-script (Arabizi) Darija text."""
    text = text.lower().strip()

    # Apply substitutions
    for pattern, replacement in ARABIZI_SUBS:
        text = re.sub(pattern, replacement, text)

    # Remove punctuation
    text = re.sub(r"[^a-z0-9\u0600-\u06ff\s]", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# =============================================================================
# Main Normaliser Class
# =============================================================================

@dataclass
class NormalisationConfig:
    """Configuration for the Darija normaliser."""
    # Arabic
    remove_diacritics:      bool = True
    normalise_alef:         bool = True
    normalise_tah_marbuta:  bool = True
    apply_word_map:         bool = False  # Conservative — may change meaning
    # Arabizi
    convert_numbers:        bool = True
    lowercase:              bool = True
    # Both
    remove_punctuation:     bool = True
    collapse_spaces:        bool = True
    min_length:             int  = 2


class DarijaNormalizer:
    """
    Production-grade Darija text normaliser.
    Handles Arabic script, Arabizi, and mixed text.
    """

    def __init__(self, config: NormalisationConfig | None = None) -> None:
        self.config = config or NormalisationConfig()

    def normalize(self, text: str) -> str:
        """Normalise a Darija text string."""
        if not text or not text.strip():
            return ""

        script = detect_script(text)

        if script == Script.ARABIC:
            return self._normalize_arabic(text)
        elif script == Script.ARABIZI:
            return self._normalize_arabizi(text)
        else:  # MIXED or UNKNOWN
            return self._normalize_mixed(text)

    def normalize_batch(self, texts: list[str]) -> list[str]:
        """Normalise a list of texts."""
        return [self.normalize(t) for t in texts]

    def _normalize_arabic(self, text: str) -> str:
        text = unicodedata.normalize("NFC", text)

        if self.config.remove_diacritics:
            text = re.sub(
                r"[\u064b-\u065f\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed]",
                "", text,
            )
        if self.config.normalise_alef:
            text = re.sub(r"[أإآٱ]", "ا", text)
        if self.config.normalise_tah_marbuta:
            text = re.sub(r"ة", "ه", text)

        text = re.sub(r"ى", "ي", text)
        text = re.sub(r"ؤ", "و", text)
        text = re.sub(r"ئ", "ي", text)
        text = re.sub(r"\u0640", "", text)  # Tatweel

        if self.config.apply_word_map:
            words = text.split()
            text  = " ".join(ARABIC_WORD_MAP.get(w, w) for w in words)

        if self.config.remove_punctuation:
            text = re.sub(r"[،,.؟?!؛;:\-–—()[\]{}\"\'«»]", " ", text)

        if self.config.collapse_spaces:
            text = re.sub(r"\s+", " ", text)

        return text.strip()

    def _normalize_arabizi(self, text: str) -> str:
        if self.config.lowercase:
            text = text.lower()

        if self.config.convert_numbers:
            for pattern, replacement in ARABIZI_SUBS[:5]:  # number subs only
                text = re.sub(pattern, replacement, text)

        if self.config.remove_punctuation:
            text = re.sub(r"[^a-z0-9\u0600-\u06ff\s]", " ", text)

        if self.config.collapse_spaces:
            text = re.sub(r"\s+", " ", text)

        return text.strip()

    def _normalize_mixed(self, text: str) -> str:
        """Handle code-switched Arabic+French+Arabizi text."""
        # Split on script boundaries, normalise each segment
        segments = re.split(r"([\u0600-\u06ff]+)", text)
        normalised = []
        for seg in segments:
            if not seg.strip():
                continue
            if re.search(r"[\u0600-\u06ff]", seg):
                normalised.append(self._normalize_arabic(seg))
            else:
                normalised.append(self._normalize_arabizi(seg))
        result = " ".join(normalised)
        return re.sub(r"\s+", " ", result).strip()


# =============================================================================
# CLI
# =============================================================================

def main() -> None:
    import argparse, sys

    parser = argparse.ArgumentParser(description="Normalise Darija text")
    parser.add_argument("--text",   help="Text to normalise (or use --input-file)")
    parser.add_argument("--input-file",  help="JSONL file with 'transcript' field")
    parser.add_argument("--output-file", help="Output JSONL file")
    parser.add_argument("--field",  default="transcript")
    args = parser.parse_args()

    normalizer = DarijaNormalizer()

    if args.text:
        script = detect_script(args.text)
        result = normalizer.normalize(args.text)
        print(f"Script:     {script.name}")
        print(f"Original:   {args.text}")
        print(f"Normalised: {result}")
        return

    if args.input_file:
        import json
        results = []
        with open(args.input_file, encoding="utf-8") as f:
            for line in f:
                row = json.loads(line)
                row[args.field + "_normalised"] = normalizer.normalize(
                    row.get(args.field, "")
                )
                results.append(row)

        output = args.output_file or args.input_file.replace(".jsonl", "_normalised.jsonl")
        with open(output, "w", encoding="utf-8") as f:
            for row in results:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
        print(f"Normalised {len(results)} records → {output}")
        return

    # Interactive mode
    print("Darija Normaliser — type text to normalise (Ctrl+C to exit)")
    while True:
        try:
            text = input("> ").strip()
            if text:
                print(f"  Script:     {detect_script(text).name}")
                print(f"  Normalised: {normalizer.normalize(text)}\n")
        except (KeyboardInterrupt, EOFError):
            break


if __name__ == "__main__":
    main()