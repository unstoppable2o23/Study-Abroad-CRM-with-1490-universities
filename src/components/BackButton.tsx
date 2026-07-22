"use client";

import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  href?: string;
  sx?: any;
}

export default function BackButton({ href, sx }: BackButtonProps) {
  const router = useRouter();

  return (
    <IconButton
      onClick={() => (href ? router.push(href) : router.back())}
      sx={{ color: "text.secondary", "&:hover": { color: "primary.main" }, ...sx }}
    >
      <ArrowBackIcon />
    </IconButton>
  );
}
