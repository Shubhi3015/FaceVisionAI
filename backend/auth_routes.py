from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import (
    LoginRequest,
    ProfileUpdateRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
    create_access_token,
    get_current_user,
    get_user_by_email,
    hash_password,
    user_to_out,
    verify_password,
)
from database import get_db
from models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Annotated[Session, Depends(get_db)]):
    email = body.email.lower().strip()
    if get_user_by_email(db, email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(body.password),
        onboarding_completed=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=user_to_out(user))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Annotated[Session, Depends(get_db)]):
    user = get_user_by_email(db, body.email.lower().strip())
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=user_to_out(user))


@router.get("/me", response_model=UserOut)
def auth_me(user: Annotated[User, Depends(get_current_user)]):
    return user_to_out(user)


@router.put("/profile", response_model=UserOut)
def update_profile(
    body: ProfileUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    if body.age is not None:
        user.age = body.age
    if body.gender is not None:
        user.gender = body.gender
    if body.skin_type is not None:
        user.skin_type = body.skin_type
    if body.allergies is not None:
        user.allergies = body.allergies
    if body.current_products is not None:
        user.current_products = body.current_products
    user.onboarding_completed = body.onboarding_completed

    db.commit()
    db.refresh(user)
    return user_to_out(user)
