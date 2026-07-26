# Mindful Threads Starter

A deliberately tiny asynchronous discussion app built with Streamlit.

## Features

- Create a thread
- Reply to a thread
- Search thread titles and posts
- Show a mindful quote beneath every thread
- Keep temporary data in Streamlit session state

## Run it

```bash
cd mindful_threads_starter
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

On Windows, activate the virtual environment with:

```bash
.venv\Scripts\activate
```

## Important limitation

The starter app stores data only in the current Streamlit browser session. Refresh behavior, a server restart, or a different user session can make that data disappear.

That is intentional for the first version. Once the interface feels right, replace `add_thread`, `add_comment`, and the initial data-loading code with Supabase queries.

## Suggested next steps

1. Add Supabase persistence.
2. Give each thread its own page.
3. Add topic channels such as `General`, `Weekly Challenge`, and `Tiny Victories`.
4. Add reactions.
5. Add login.
6. Let a thread author choose a quote category.
# mindful_communicationsapp
