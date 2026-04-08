from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import hashlib
import secrets
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'kingdom_citizens')]

app = FastAPI(title="Kingdom Citizens API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# ==================== HELPERS ====================

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password: str, stored: str) -> bool:
    try:
        salt, hashed = stored.split(":")
        return hashlib.sha256((password + salt).encode()).hexdigest() == hashed
    except:
        return False

def generate_token(member_id: str) -> str:
    return hashlib.sha256(f"{member_id}{secrets.token_hex(16)}".encode()).hexdigest()

# ==================== MODELS ====================

class Member(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    role: str = "member"
    group_ids: List[str] = []
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MemberCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    role: str = "member"
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

# Auth Models
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    bio: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    member: Member

# Group Models
class Group(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    leader_id: Optional[str] = None
    member_ids: List[str] = []
    meeting_day: Optional[str] = None
    meeting_time: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    leader_id: Optional[str] = None
    meeting_day: Optional[str] = None
    meeting_time: Optional[str] = None

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    leader_id: Optional[str] = None
    meeting_day: Optional[str] = None
    meeting_time: Optional[str] = None

# Study Session Models
class StudySession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    date: str
    time: str
    location: Optional[str] = None
    group_id: Optional[str] = None
    host_id: str
    attendee_ids: List[str] = []
    scripture_reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StudySessionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: str
    time: str
    location: Optional[str] = None
    group_id: Optional[str] = None
    host_id: str
    scripture_reference: Optional[str] = None

class StudySessionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    scripture_reference: Optional[str] = None
    notes: Optional[str] = None

# Bible Verse Discussion Models
class VerseDiscussion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    verse_reference: str
    verse_text: str
    shared_by_id: str
    shared_by_name: str
    reflection: Optional[str] = None
    group_id: Optional[str] = None
    image: Optional[str] = None
    comments: List[dict] = []
    likes: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VerseDiscussionCreate(BaseModel):
    verse_reference: str
    verse_text: str
    shared_by_id: str
    shared_by_name: str
    reflection: Optional[str] = None
    group_id: Optional[str] = None
    image: Optional[str] = None

class CommentCreate(BaseModel):
    member_id: str
    member_name: str
    text: str

# Prayer Request Models
class PrayerRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    requested_by_id: str
    requested_by_name: str
    is_anonymous: bool = False
    is_answered: bool = False
    group_id: Optional[str] = None
    praying_members: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    answered_at: Optional[datetime] = None

class PrayerRequestCreate(BaseModel):
    title: str
    description: str
    requested_by_id: str
    requested_by_name: str
    is_anonymous: bool = False
    group_id: Optional[str] = None

class PrayerRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_answered: Optional[bool] = None

# Study Notes Models
class StudyNote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    member_id: str
    scripture_reference: Optional[str] = None
    session_id: Optional[str] = None
    tags: List[str] = []
    is_private: bool = True
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class StudyNoteCreate(BaseModel):
    title: str
    content: str
    member_id: str
    scripture_reference: Optional[str] = None
    session_id: Optional[str] = None
    tags: List[str] = []
    is_private: bool = True
    image: Optional[str] = None

class StudyNoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    scripture_reference: Optional[str] = None
    tags: Optional[List[str]] = None
    is_private: Optional[bool] = None
    image: Optional[str] = None

# Message Models
class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    sender_name: str
    recipient_id: Optional[str] = None
    group_id: Optional[str] = None
    content: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MessageCreate(BaseModel):
    sender_id: str
    sender_name: str
    recipient_id: Optional[str] = None
    group_id: Optional[str] = None
    content: str

# Announcement Models
class Announcement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author_id: str
    author_name: str
    group_id: Optional[str] = None
    is_pinned: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    author_id: str
    author_name: str
    group_id: Optional[str] = None
    is_pinned: bool = False

# Media Content Models
class MediaContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    media_type: str
    category: str
    url: str
    thumbnail: Optional[str] = None
    author_id: str
    author_name: str
    is_official: bool = False
    likes: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MediaContentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    media_type: str
    category: str
    url: str
    thumbnail: Optional[str] = None
    author_id: str
    author_name: str
    is_official: bool = False

# ==================== AUTH DEPENDENCY ====================

async def get_current_member(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    session = await db.sessions_auth.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    member = await db.members.find_one({"id": session["member_id"]})
    if not member:
        raise HTTPException(status_code=401, detail="Member not found")
    return member

async def require_admin(current_member: dict = Depends(get_current_member)):
    if current_member.get("role") not in ["admin", "leader"]:
        raise HTTPException(status_code=403, detail="Admin or leader role required")
    return current_member

# ==================== HEALTH ====================

@api_router.get("/")
async def root():
    return {"message": "Kingdom Citizens API", "status": "active"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(input: RegisterRequest):
    existing = await db.members.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # First registered user becomes admin
    count = await db.members.count_documents({})
    role = "admin" if count == 0 else "member"
    
    member = Member(
        name=input.name,
        email=input.email,
        phone=input.phone,
        role=role,
        bio=input.bio
    )
    member_dict = member.dict()
    member_dict["password_hash"] = hash_password(input.password)
    await db.members.insert_one(member_dict)
    
    token = generate_token(member.id)
    await db.sessions_auth.insert_one({"token": token, "member_id": member.id, "created_at": datetime.utcnow()})
    
    return AuthResponse(token=token, member=member)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(input: LoginRequest):
    member_doc = await db.members.find_one({"email": input.email})
    if not member_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    password_hash = member_doc.get("password_hash", "")
    if not verify_password(input.password, password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = generate_token(member_doc["id"])
    await db.sessions_auth.insert_one({"token": token, "member_id": member_doc["id"], "created_at": datetime.utcnow()})
    
    member = Member(**{k: v for k, v in member_doc.items() if k != "password_hash"})
    return AuthResponse(token=token, member=member)

@api_router.post("/auth/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials:
        await db.sessions_auth.delete_one({"token": credentials.credentials})
    return {"message": "Logged out"}

@api_router.get("/auth/me", response_model=Member)
async def get_me(current_member: dict = Depends(get_current_member)):
    return Member(**{k: v for k, v in current_member.items() if k != "password_hash"})

# ==================== MEMBER ROUTES ====================

@api_router.post("/members", response_model=Member)
async def create_member(input: MemberCreate):
    existing = await db.members.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    member = Member(**input.dict())
    await db.members.insert_one(member.dict())
    return member

@api_router.get("/members", response_model=List[Member])
async def get_members():
    members = await db.members.find().to_list(1000)
    return [Member(**{k: v for k, v in m.items() if k != "password_hash"}) for m in members]

@api_router.get("/members/{member_id}", response_model=Member)
async def get_member(member_id: str):
    member = await db.members.find_one({"id": member_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return Member(**{k: v for k, v in member.items() if k != "password_hash"})

@api_router.get("/members/email/{email}", response_model=Member)
async def get_member_by_email(email: str):
    member = await db.members.find_one({"email": email})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return Member(**{k: v for k, v in member.items() if k != "password_hash"})

@api_router.put("/members/{member_id}", response_model=Member)
async def update_member(member_id: str, input: MemberUpdate):
    update_data = {k: v for k, v in input.dict().items() if v is not None}
    if update_data:
        await db.members.update_one({"id": member_id}, {"$set": update_data})
    member = await db.members.find_one({"id": member_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return Member(**{k: v for k, v in member.items() if k != "password_hash"})

@api_router.delete("/members/{member_id}")
async def delete_member(member_id: str, admin: dict = Depends(require_admin)):
    result = await db.members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    await db.sessions_auth.delete_many({"member_id": member_id})
    return {"message": "Member deleted"}

# ==================== GROUP ROUTES ====================

@api_router.post("/groups", response_model=Group)
async def create_group(input: GroupCreate):
    group = Group(**input.dict())
    await db.groups.insert_one(group.dict())
    return group

@api_router.get("/groups", response_model=List[Group])
async def get_groups():
    groups = await db.groups.find().to_list(1000)
    return [Group(**g) for g in groups]

@api_router.get("/groups/{group_id}", response_model=Group)
async def get_group(group_id: str):
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return Group(**group)

@api_router.put("/groups/{group_id}", response_model=Group)
async def update_group(group_id: str, input: GroupUpdate):
    update_data = {k: v for k, v in input.dict().items() if v is not None}
    if update_data:
        await db.groups.update_one({"id": group_id}, {"$set": update_data})
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return Group(**group)

@api_router.post("/groups/{group_id}/members/{member_id}")
async def add_member_to_group(group_id: str, member_id: str):
    await db.groups.update_one({"id": group_id}, {"$addToSet": {"member_ids": member_id}})
    await db.members.update_one({"id": member_id}, {"$addToSet": {"group_ids": group_id}})
    return {"message": "Member added to group"}

@api_router.delete("/groups/{group_id}/members/{member_id}")
async def remove_member_from_group(group_id: str, member_id: str):
    await db.groups.update_one({"id": group_id}, {"$pull": {"member_ids": member_id}})
    await db.members.update_one({"id": member_id}, {"$pull": {"group_ids": group_id}})
    return {"message": "Member removed from group"}

@api_router.delete("/groups/{group_id}")
async def delete_group(group_id: str, admin: dict = Depends(require_admin)):
    result = await db.groups.delete_one({"id": group_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Group deleted"}

# ==================== STUDY SESSION ROUTES ====================

@api_router.post("/sessions", response_model=StudySession)
async def create_session(input: StudySessionCreate):
    session = StudySession(**input.dict())
    await db.sessions.insert_one(session.dict())
    return session

@api_router.get("/sessions", response_model=List[StudySession])
async def get_sessions(group_id: Optional[str] = None):
    query = {}
    if group_id:
        query["group_id"] = group_id
    sessions = await db.sessions.find(query).sort("date", -1).to_list(1000)
    return [StudySession(**s) for s in sessions]

@api_router.get("/sessions/upcoming", response_model=List[StudySession])
async def get_upcoming_sessions():
    today = datetime.utcnow().strftime("%Y-%m-%d")
    sessions = await db.sessions.find({"date": {"$gte": today}}).sort("date", 1).to_list(100)
    return [StudySession(**s) for s in sessions]

@api_router.get("/sessions/{session_id}", response_model=StudySession)
async def get_session(session_id: str):
    session = await db.sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return StudySession(**session)

@api_router.put("/sessions/{session_id}", response_model=StudySession)
async def update_session(session_id: str, input: StudySessionUpdate):
    update_data = {k: v for k, v in input.dict().items() if v is not None}
    if update_data:
        await db.sessions.update_one({"id": session_id}, {"$set": update_data})
    session = await db.sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return StudySession(**session)

@api_router.post("/sessions/{session_id}/attend/{member_id}")
async def attend_session(session_id: str, member_id: str):
    await db.sessions.update_one({"id": session_id}, {"$addToSet": {"attendee_ids": member_id}})
    return {"message": "Attendance recorded"}

@api_router.delete("/sessions/{session_id}/attend/{member_id}")
async def cancel_attendance(session_id: str, member_id: str):
    await db.sessions.update_one({"id": session_id}, {"$pull": {"attendee_ids": member_id}})
    return {"message": "Attendance cancelled"}

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, admin: dict = Depends(require_admin)):
    result = await db.sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted"}

# ==================== VERSE DISCUSSION ROUTES ====================

@api_router.post("/verses", response_model=VerseDiscussion)
async def create_verse_discussion(input: VerseDiscussionCreate):
    verse = VerseDiscussion(**input.dict())
    await db.verses.insert_one(verse.dict())
    return verse

@api_router.get("/verses", response_model=List[VerseDiscussion])
async def get_verse_discussions(group_id: Optional[str] = None):
    query = {}
    if group_id:
        query["group_id"] = group_id
    verses = await db.verses.find(query).sort("created_at", -1).to_list(1000)
    return [VerseDiscussion(**v) for v in verses]

@api_router.post("/verses/{verse_id}/comments")
async def add_comment(verse_id: str, comment: CommentCreate):
    comment_data = {
        "id": str(uuid.uuid4()),
        "member_id": comment.member_id,
        "member_name": comment.member_name,
        "text": comment.text,
        "created_at": datetime.utcnow().isoformat()
    }
    await db.verses.update_one({"id": verse_id}, {"$push": {"comments": comment_data}})
    return {"message": "Comment added", "comment": comment_data}

@api_router.post("/verses/{verse_id}/like/{member_id}")
async def like_verse(verse_id: str, member_id: str):
    await db.verses.update_one({"id": verse_id}, {"$addToSet": {"likes": member_id}})
    return {"message": "Liked"}

@api_router.delete("/verses/{verse_id}/like/{member_id}")
async def unlike_verse(verse_id: str, member_id: str):
    await db.verses.update_one({"id": verse_id}, {"$pull": {"likes": member_id}})
    return {"message": "Unliked"}

@api_router.delete("/verses/{verse_id}")
async def delete_verse_discussion(verse_id: str, admin: dict = Depends(require_admin)):
    result = await db.verses.delete_one({"id": verse_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Verse discussion not found")
    return {"message": "Verse discussion deleted"}

# ==================== PRAYER REQUEST ROUTES ====================

@api_router.post("/prayers", response_model=PrayerRequest)
async def create_prayer_request(input: PrayerRequestCreate):
    prayer = PrayerRequest(**input.dict())
    await db.prayers.insert_one(prayer.dict())
    return prayer

@api_router.get("/prayers", response_model=List[PrayerRequest])
async def get_prayer_requests(group_id: Optional[str] = None, answered: Optional[bool] = None):
    query = {}
    if group_id:
        query["group_id"] = group_id
    if answered is not None:
        query["is_answered"] = answered
    prayers = await db.prayers.find(query).sort("created_at", -1).to_list(1000)
    return [PrayerRequest(**p) for p in prayers]

@api_router.put("/prayers/{prayer_id}", response_model=PrayerRequest)
async def update_prayer_request(prayer_id: str, input: PrayerRequestUpdate):
    update_data = {k: v for k, v in input.dict().items() if v is not None}
    if input.is_answered:
        update_data["answered_at"] = datetime.utcnow()
    if update_data:
        await db.prayers.update_one({"id": prayer_id}, {"$set": update_data})
    prayer = await db.prayers.find_one({"id": prayer_id})
    if not prayer:
        raise HTTPException(status_code=404, detail="Prayer request not found")
    return PrayerRequest(**prayer)

@api_router.post("/prayers/{prayer_id}/pray/{member_id}")
async def pray_for_request(prayer_id: str, member_id: str):
    await db.prayers.update_one({"id": prayer_id}, {"$addToSet": {"praying_members": member_id}})
    return {"message": "Prayer recorded"}

@api_router.delete("/prayers/{prayer_id}")
async def delete_prayer_request(prayer_id: str, admin: dict = Depends(require_admin)):
    result = await db.prayers.delete_one({"id": prayer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prayer request not found")
    return {"message": "Prayer request deleted"}

# ==================== STUDY NOTES ROUTES ====================

@api_router.post("/notes", response_model=StudyNote)
async def create_study_note(input: StudyNoteCreate):
    note = StudyNote(**input.dict())
    await db.notes.insert_one(note.dict())
    return note

@api_router.get("/notes", response_model=List[StudyNote])
async def get_study_notes(member_id: Optional[str] = None, include_public: bool = True):
    query = {}
    if member_id:
        if include_public:
            query["$or"] = [{"member_id": member_id}, {"is_private": False}]
        else:
            query["member_id"] = member_id
    else:
        query["is_private"] = False
    notes = await db.notes.find(query).sort("created_at", -1).to_list(1000)
    return [StudyNote(**n) for n in notes]

@api_router.put("/notes/{note_id}", response_model=StudyNote)
async def update_study_note(note_id: str, input: StudyNoteUpdate):
    update_data = {k: v for k, v in input.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    if update_data:
        await db.notes.update_one({"id": note_id}, {"$set": update_data})
    note = await db.notes.find_one({"id": note_id})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return StudyNote(**note)

@api_router.delete("/notes/{note_id}")
async def delete_study_note(note_id: str, current_member: dict = Depends(get_current_member)):
    note = await db.notes.find_one({"id": note_id})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    # Allow deletion if owner or admin
    if note["member_id"] != current_member["id"] and current_member.get("role") not in ["admin", "leader"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.notes.delete_one({"id": note_id})
    return {"message": "Note deleted"}

# ==================== MESSAGE ROUTES ====================

@api_router.post("/messages", response_model=Message)
async def create_message(input: MessageCreate):
    message = Message(**input.dict())
    await db.messages.insert_one(message.dict())
    return message

@api_router.get("/messages", response_model=List[Message])
async def get_messages(member_id: str, conversation_with: Optional[str] = None, group_id: Optional[str] = None):
    if group_id:
        query = {"group_id": group_id}
    elif conversation_with:
        query = {
            "$or": [
                {"sender_id": member_id, "recipient_id": conversation_with},
                {"sender_id": conversation_with, "recipient_id": member_id}
            ]
        }
    else:
        query = {"$or": [{"sender_id": member_id}, {"recipient_id": member_id}]}
    messages = await db.messages.find(query).sort("created_at", -1).to_list(1000)
    return [Message(**m) for m in messages]

@api_router.get("/messages/conversations/{member_id}")
async def get_conversations(member_id: str):
    messages = await db.messages.find({
        "$or": [{"sender_id": member_id}, {"recipient_id": member_id}],
        "group_id": None
    }).to_list(10000)
    conversations = {}
    for msg in messages:
        partner_id = msg["recipient_id"] if msg["sender_id"] == member_id else msg["sender_id"]
        if partner_id and partner_id not in conversations:
            conversations[partner_id] = msg
        elif partner_id and msg["created_at"] > conversations[partner_id]["created_at"]:
            conversations[partner_id] = msg
    return list(conversations.values())

@api_router.put("/messages/{message_id}/read")
async def mark_message_read(message_id: str):
    await db.messages.update_one({"id": message_id}, {"$set": {"is_read": True}})
    return {"message": "Marked as read"}

@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str, current_member: dict = Depends(get_current_member)):
    msg = await db.messages.find_one({"id": message_id})
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if msg["sender_id"] != current_member["id"] and current_member.get("role") not in ["admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.messages.delete_one({"id": message_id})
    return {"message": "Message deleted"}

# ==================== ANNOUNCEMENT ROUTES ====================

@api_router.post("/announcements", response_model=Announcement)
async def create_announcement(input: AnnouncementCreate):
    announcement = Announcement(**input.dict())
    await db.announcements.insert_one(announcement.dict())
    return announcement

@api_router.get("/announcements", response_model=List[Announcement])
async def get_announcements(group_id: Optional[str] = None):
    query = {}
    if group_id:
        query["$or"] = [{"group_id": group_id}, {"group_id": None}]
    announcements = await db.announcements.find(query).sort([("is_pinned", -1), ("created_at", -1)]).to_list(1000)
    return [Announcement(**a) for a in announcements]

@api_router.put("/announcements/{announcement_id}/pin")
async def toggle_pin_announcement(announcement_id: str, pin: bool = True, admin: dict = Depends(require_admin)):
    await db.announcements.update_one({"id": announcement_id}, {"$set": {"is_pinned": pin}})
    return {"message": f"Announcement {'pinned' if pin else 'unpinned'}"}

@api_router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str, admin: dict = Depends(require_admin)):
    result = await db.announcements.delete_one({"id": announcement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted"}

# ==================== MEDIA CONTENT ROUTES ====================

@api_router.post("/media", response_model=MediaContent)
async def create_media_content(input: MediaContentCreate):
    media = MediaContent(**input.dict())
    await db.media.insert_one(media.dict())
    return media

@api_router.get("/media", response_model=List[MediaContent])
async def get_media_content(media_type: Optional[str] = None, category: Optional[str] = None, official_only: bool = False):
    query = {}
    if media_type:
        query["media_type"] = media_type
    if category:
        query["category"] = category
    if official_only:
        query["is_official"] = True
    media = await db.media.find(query).sort([("is_official", -1), ("created_at", -1)]).to_list(1000)
    return [MediaContent(**m) for m in media]

@api_router.post("/media/{media_id}/like/{member_id}")
async def like_media(media_id: str, member_id: str):
    await db.media.update_one({"id": media_id}, {"$addToSet": {"likes": member_id}})
    return {"message": "Liked"}

@api_router.delete("/media/{media_id}/like/{member_id}")
async def unlike_media(media_id: str, member_id: str):
    await db.media.update_one({"id": media_id}, {"$pull": {"likes": member_id}})
    return {"message": "Unliked"}

@api_router.delete("/media/{media_id}")
async def delete_media_content(media_id: str, admin: dict = Depends(require_admin)):
    result = await db.media.delete_one({"id": media_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"message": "Media deleted"}

# ==================== SETUP ====================

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
