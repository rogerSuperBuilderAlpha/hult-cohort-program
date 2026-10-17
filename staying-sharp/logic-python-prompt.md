# Logic and Python

Copy the prompt below into Claude, or any AI chat that can make artifacts or interactive HTML. Work each step yourself, and reveal the answer only after you have tried.

```text
Create a NEW set of logic and Python exercises in the same style as our in-class logic packet. Deliver it as an interactive artifact (HTML + JavaScript + CSS), not a static page. Generate fresh arguments every time this prompt is run. Do not reuse the Socrates example below as one of the five.

Start with a level choice:
- Easy: 2 letters, 4 rows
- Medium: 3 letters, 8 rows
- Hard: 4 letters, 16 rows

After the student picks a level, show 5 short, real arguments at that level. Draw them from classic or contemporary philosophy, or from everyday or business reasoning. Write each argument in plain English, in 3 to 5 sentences. Mix valid and invalid arguments, and include at least one invalid argument.

Every argument uses the same 4 steps. Hide each answer until the student has attempted that step (they submit a try, or click Reveal only after a try). When all four steps are done, show a full worked answer key for that argument: the translation, the truth table, the Python code and its output, and the verdict (valid or invalid, and sound or unsound).

Step 1. Pick a letter for each simple statement. Translate the premises and the conclusion into propositional logic.

Step 2. Build the full truth table. Decide valid or invalid. If the argument is invalid, give the counterexample row: every premise true, and the conclusion false.

Step 3. Write a Python check. Use only plain nested loops, one loop per letter, in this form:

for X in [True, False]:

Use and, or, and not. Write an arrow X → Y as (not X) or Y. Do not use itertools, lambdas, def, or bitwise operators. Print any row where all premises are True and the conclusion is False.

Step 4. Judge soundness. Is each premise actually true in the real world? Write a short defense of that judgment.

End with one optional extra-credit question: how many rows are needed for n letters, and why this loop cannot be made much faster (2ⁿ growth). Hide that answer until the student has attempted it.

Match this worked example for format only. Do not assign it.

Socrates.
P1: All humans are mortal, rendered propositionally as H → M.
P2: Socrates is human (H).
Conclusion: M.

Python check:

for H in [True, False]:
    for M in [True, False]:
        p1 = (not H) or M
        p2 = H
        c = M
        if p1 and p2 and not c:
            print("Counterexample:", H, M)

No output means the argument is valid.
```
