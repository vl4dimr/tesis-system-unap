from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Formato UNAP 2.0
    page_width_cm: float = 21.0  # A4
    page_height_cm: float = 29.7  # A4
    margin_top_cm: float = 3.5
    margin_bottom_cm: float = 2.5
    margin_left_cm: float = 2.5
    margin_right_cm: float = 2.5
    font_name: str = "Times New Roman"
    font_size_pt: int = 12
    line_spacing: float = 2.0
    first_line_indent_cm: float = 1.25

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
