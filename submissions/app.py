import random
from datetime import datetime

import streamlit as st


st.set_page_config(
    page_title="Mindful Threads",
    page_icon="🌿",
    layout="centered",
)

QUOTES = [
    "You do not have to solve everything in this moment.",
    "Pause long enough to notice what is already okay.",
    "A small reset still counts.",
    "Attention is a form of care.",
    "Make room for the next honest thought.",
]


def make_id() -> str:
    """Create a simple unique-enough ID for this starter app."""
    return datetime.now().strftime("%Y%m%d%H%M%S%f")

def rerun_app():
    if hasattr(st, "rerun"):
        st.rerun()
    else:
        st.experimental_rerun()

def initialize_demo_data() -> None:
    """Create temporary in-memory data for the current browser session."""
    if "threads" not in st.session_state:
        st.session_state.threads = [
            {
                "id": "demo-1",
                "author": "Alaska",
                "title": "What helped you reset today?",
                "body": "Mine was stepping away from my laptop for ten minutes.",
                "created_at": "Demo thread",
                "comments": [
                    {
                        "id": "demo-comment-1",
                        "author": "Randy",
                        "body": "A walk and absolutely no notifications.",
                    }
                ],
            }
        ]


def add_thread(author: str, title: str, body: str) -> None:
    st.session_state.threads.insert(
        0,
        {
            "id": make_id(),
            "author": author.strip() or "Anonymous",
            "title": title.strip(),
            "body": body.strip(),
            "created_at": datetime.now().strftime("%b %d, %Y at %I:%M %p"),
            "comments": [],
        },
    )


def add_comment(thread_id: str, author: str, body: str) -> None:
    for thread in st.session_state.threads:
        if thread["id"] == thread_id:
            thread["comments"].append(
                {
                    "id": make_id(),
                    "author": author.strip() or "Anonymous",
                    "body": body.strip(),
                }
            )
            return


initialize_demo_data()

st.title("🌿 Mindful Threads")
st.caption("A tiny async community board for sharing thoughts without needing everyone online at once.")

with st.form("new_thread_form", clear_on_submit=True):
    st.subheader("Start a thread")
    author = st.text_input("Your name", placeholder="Alaska")
    title = st.text_input("Thread title", placeholder="What is on your mind?")
    body = st.text_area(
        "Post",
        placeholder="Share a thought, question, reflection, or tiny victory...",
        height=120,
    )

    st.info("Pause for a second: does this post say what you actually mean? Would it make sense if you were reading this out loud to someone in a distracting Irish bar?")

    paused_before_posting = st.checkbox("Yes — I gave it a quick reread.")

    submitted = st.form_submit_button("Post thread", type="primary")

    if submitted:
        if not title.strip() or not body.strip():
            st.error("Add both a title and a post.")
        elif not paused_before_posting:
            st.error("Give your post a quick reread before submitting")
        else:
            add_thread(author, title, body)
            rerun_app()

st.divider()

search = st.text_input("Search threads", placeholder="Try: reset, sleep, work...").strip().lower()

visible_threads = [
    thread
    for thread in st.session_state.threads
    if not search
    or search in thread["title"].lower()
    or search in thread["body"].lower()
]

if not visible_threads:
    st.info("No threads match that search.")

for thread in visible_threads:
    with st.container():
        st.subheader(thread["title"])
        st.caption(f"Posted by {thread['author']} · {thread['created_at']}")
        st.write(thread["body"])

        st.markdown(f"**Replies ({len(thread['comments'])})**")

        if thread["comments"]:
            for comment in thread["comments"]:
                st.markdown(f"**{comment['author']}**")
                st.write(comment["body"])
        else:
            st.caption("No replies yet. Be the first.")

        with st.form(f"comment_form_{thread['id']}", clear_on_submit=True):
            comment_author = st.text_input(
                "Your name",
                key=f"comment_author_{thread['id']}",
                placeholder="Name",
            )
            comment_body = st.text_area(
                "Reply",
                key=f"comment_body_{thread['id']}",
                placeholder="Add a thoughtful reply...",
                height=80,
            )
            comment_submitted = st.form_submit_button("Reply")

            if comment_submitted:
                if not comment_body.strip():
                    st.error("Write a reply first.")
                else:
                    add_comment(thread["id"], comment_author, comment_body)
                    rerun_app()

        st.info(f"✨ {random.choice(QUOTES)}")

st.caption(
    "Starter version: data lives only in Streamlit session state. "
    "The next step is swapping the storage functions for Supabase."
)
