#!/usr/bin/env python3
"""Taste v3 concept roll (degraded port of Impeccable's concept-seed).

Impeccable deals catalog challengers from a remote roll service. Without that
service, this script still breaks the model's ranking rut: you rank your own
grounded candidates by resonance, the dice decide which reach the user and
which one leads.

Usage:
  python3 concept_roll.py --scope direction --mode persuade --candidates 7
  python3 concept_roll.py --scope direction --mode persuade --candidates 7 --from seed:ab12cd34ef56ab78 --reroll 1 --register safer
  python3 concept_roll.py --scope surface --mode operate --candidates 6
"""
import argparse
import hashlib
import random
import secrets
import sys

MODES = ("persuade", "experience", "operate", "read")

MODE_RULES = {
    "persuade": "The opening makes the offer intelligible and desirable, exposes the working primary action, "
                "and proves something only this product can. The world may carry the page, never become a picture of it.",
    "experience": "The work itself leads from the first viewport; the interface recedes.",
    "operate": "The world lends only type, palette, density and one signature move. Never layout, navigation "
               "model or controls. A category-fluent user finds everything before noticing the world.",
    "read": "The world owns the frame (masthead, rail, ground, openers, how code and tables are set); the reading "
            "column stays calm. Never replace the reading order or navigation.",
}


def parse():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--scope", choices=("direction", "surface"), required=True)
    p.add_argument("--mode", choices=MODES, required=True)
    p.add_argument("--candidates", type=int, default=7, help="how many grounded candidates you ranked (1 = top)")
    p.add_argument("--from", dest="seed", default=None, help="seed reference from an earlier roll (seed:<16 hex>)")
    p.add_argument("--reroll", type=int, default=0, help="re-roll counter: 1 on the first re-roll, counting up")
    p.add_argument("--register", choices=("plain", "safer", "bolder"), default="plain")
    return p.parse_args()


def order_for(seed_hex, n):
    rng = random.Random(int(hashlib.sha256(seed_hex.encode()).hexdigest(), 16))
    idx = list(range(1, n + 1))
    rng.shuffle(idx)
    return idx


def main():
    a = parse()
    if a.candidates < 3:
        sys.exit("Need at least 3 grounded candidates. Dig further into the audience's world (process.md §4.1).")
    if a.scope == "direction" and a.candidates < 5:
        print("WARNING: a direction round expects 7 candidates spanning 3+ material families.\n")

    if a.seed:
        seed_hex = a.seed.split(":", 1)[-1].strip().lower()
    else:
        seed_hex = secrets.token_hex(8)
    shuffled = order_for(seed_hex, a.candidates)

    # Every round consumes three slots; earlier hands are eliminated on re-roll.
    shown = set(shuffled[: 3 * a.reroll]) if a.reroll else set()
    remaining = [i for i in shuffled if i not in shown]

    register_note = ""
    if a.reroll and a.register == "safer":
        remaining = sorted(remaining)  # your top-ranked remaining (most familiar) candidates first
        register_note = ("SAFER register: dealt from your highest-ranked remaining candidates. Also offer the "
                         "standing exit (the category standard played straight) against 2-3 named competitors.")
    elif a.reroll and a.register == "bolder":
        register_note = ("BOLDER register unavailable: bolder deals foreign forms from Impeccable's catalog, and "
                         "this roll is degraded with no catalog. Tell the user, then run a plain grounded re-roll "
                         "pushed to full commitment.")

    hand = remaining[:3]
    print(f"{a.scope.upper()} CONCEPT ROLL  (mode: {a.mode}; source: degraded, local dice; "
          f"seed reference: seed:{seed_hex}; reroll: {a.reroll}; register: {a.register})")
    print("DEGRADED: no catalog challengers and no quality-bar boards. Say so to the user in one line; "
          "do not present this as a full roll.\n")

    if not hand:
        print("POOL EXHAUSTED: every candidate has been shown. Ask the user what quality is missing, "
              "write a fresh list of seven, and roll again without --from.")
        return
    if len(hand) < 3:
        print(f"NOTE: only {len(hand)} unseen candidate(s) left.\n")
    if a.reroll >= 2:
        print("After two consecutive re-rolls, ask the user what quality is missing before dealing again.\n")
    if register_note:
        print(register_note + "\n")

    if a.scope == "direction":
        print(f"ASSIGNED: candidate #{hand[0]} on your ranked list. Build this one unless the user or brief pins "
              "another, or it cannot carry the product's truth on named factual grounds (taste is never grounds).")
        if len(hand) > 1:
            print(f"DEALT ALTERNATES: " + ", ".join(f"#{i}" for i in hand[1:]) + " (full cards, same anatomy).")
        if 1 in hand:
            print("PICK CARD: none. Your top-ranked candidate was dealt; note on its card that it topped your list.")
        else:
            print("PICK CARD: add one card for your #1 candidate, kicker \"Taste's pick\", never in the lead position, "
                  "with an honest risk line naming its familiarity when true.")
        print("STANDING EXIT: always offer the category standard, played straight, quiet, never recommended.")
        print("RE-ROLL: offer plain / safer / bolder with an optional one-line steer.\n")
        print("PRESENT: one direction fully committed (world, first viewport, visitor path, signature interaction, "
              "cross-surface reach, honest risk), then the options as tappable choices: assigned (lead), alternates, "
              "pick (if any), standing exit, re-roll.")
        print("NEXT: write the direction contract (process.md §5) with this seed reference in FORM, before any code.")
    else:
        print(f"LEAD STRUCTURE: #{hand[0]} (mark it as the roll).")
        if len(hand) > 1:
            print("DEALT STRUCTURES: " + ", ".join(f"#{i}" for i in hand[1:]) + ".")
        print("PRESENT: three dealt structures as equal cards (navigation model, work-area split, which data leads, "
              "density, where the signature move sits). No pick card, no standing exit at surface scope. "
              "The user locks one; the world stays fixed.")

    print("\nMODE RULES: " + MODE_RULES[a.mode])
    print("A user- or brief-pinned decision beats the roll, always.")


if __name__ == "__main__":
    main()
