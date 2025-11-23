import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Box, IconButton, Divider, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import ImageIcon from "@mui/icons-material/Image";
import LinkIcon from "@mui/icons-material/Link";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import TableChartIcon from "@mui/icons-material/TableChart";
import { useEffect, useState, useRef, useMemo } from "react";

/**
 * 에디터 Props 타입
 */
interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number | string;
  readOnly?: boolean;
}

/**
 * 툴바 스타일
 */
const Toolbar = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
  padding: "8px",
  backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#f5f5f5",
  borderRadius: "4px 4px 0 0",
  border: `1px solid ${theme.palette.divider}`,
  borderBottom: "none",
  alignItems: "center",
}));

/**
 * 에디터 컨테이너 스타일
 */
const EditorContainer = styled(Box)<{ height?: number | string }>(
  ({ theme, height = 400 }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "0 0 4px 4px",
    backgroundColor: theme.palette.background.paper,
    "& .ProseMirror": {
      minHeight: typeof height === "number" ? `${height}px` : height,
      maxHeight: typeof height === "number" ? `${height}px` : height,
      overflowY: "auto",
      padding: "16px",
      outline: "none",
      fontSize: "1rem",
      lineHeight: 1.6,
      fontFamily: theme.typography.fontFamily,
      "&:focus": {
        outline: "none",
      },
      // 플레이스홀더 스타일
      "& p.is-editor-empty:first-of-type::before": {
        color: theme.palette.text.secondary,
        content: "attr(data-placeholder)",
        float: "left",
        height: 0,
        pointerEvents: "none",
      },
      // 이미지 반응형
      "& img": {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: "8px 0",
        borderRadius: "4px",
      },
      // 링크 스타일
      "& a": {
        color: theme.palette.primary.main,
        textDecoration: "underline",
        cursor: "pointer",
      },
      // 코드 블록
      "& pre": {
        backgroundColor: theme.palette.mode === "dark" ? "#2d2d2d" : "#f5f5f5",
        padding: "12px",
        borderRadius: "4px",
        overflow: "auto",
        "& code": {
          fontFamily: "monospace",
          fontSize: "0.875rem",
        },
      },
      // 인라인 코드
      "& code": {
        backgroundColor: theme.palette.mode === "dark" ? "#2d2d2d" : "#f5f5f5",
        padding: "2px 6px",
        borderRadius: "3px",
        fontFamily: "monospace",
        fontSize: "0.875rem",
      },
      // 인용구
      "& blockquote": {
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        paddingLeft: "16px",
        marginLeft: 0,
        fontStyle: "italic",
        color: theme.palette.text.secondary,
      },
      // 표 스타일
      "& table": {
        borderCollapse: "collapse",
        margin: "16px 0",
        overflow: "hidden",
        tableLayout: "fixed",
        width: "100%",
        border: `1px solid ${theme.palette.divider}`,
      },
      "& td, & th": {
        border: `1px solid ${theme.palette.divider}`,
        boxSizing: "border-box",
        minWidth: "1em",
        padding: "8px 12px",
        position: "relative",
        verticalAlign: "top",
        "> *": {
          marginBottom: 0,
        },
      },
      "& th": {
        backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#f5f5f5",
        fontWeight: 600,
        textAlign: "left",
      },
      "& .selectedCell:after": {
        background: theme.palette.action.selected,
        content: '""',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        pointerEvents: "none",
        position: "absolute",
        zIndex: 2,
      },
    },
    // 모바일 최적화
    [theme.breakpoints.down("sm")]: {
      "& .ProseMirror": {
        padding: "12px",
        fontSize: "16px", // iOS 자동 확대 방지
      },
    },
  })
);

/**
 * 툴바 버튼 스타일
 */
const ToolbarButton = styled(IconButton)(({ theme }) => ({
  padding: "6px",
  borderRadius: "4px",
  "&.active": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

/**
 * 색상 피커 팝오버 스타일
 */
const ColorPickerPopover = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: "4px",
  padding: "8px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  boxShadow: theme.shadows[4],
  zIndex: 1000,
  minWidth: "260px",
  // 모바일에서는 오른쪽 정렬하고 화면에 맞춤
  "@media (max-width: 599px)": {
    left: "auto",
    right: 0,
    minWidth: "auto",
    padding: "8px",
  },
}));

/**
 * 색상 그리드 스타일
 */
const ColorGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "4px",
  marginBottom: "4px",
  // 넓은 화면(600px 이상)에서만 10컬럼으로 1줄 표시
  "@media (min-width: 600px)": {
    gridTemplateColumns: "repeat(10, 1fr)",
    gap: "4px",
  },
});

/**
 * 색상 섹션 제목 스타일
 */
const ColorSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: "6px",
  marginTop: "8px",
  "&:first-of-type": {
    marginTop: 0,
  },
}));

/**
 * 색상 버튼 스타일
 */
const ColorButton = styled("button")<{ color: string }>(({ color, theme }) => ({
  width: "28px",
  height: "28px",
  borderRadius: "3px",
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: color,
  cursor: "pointer",
  transition: "all 0.15s",
  position: "relative",
  "&:hover": {
    transform: "scale(1.2)",
    borderColor: theme.palette.primary.main,
    borderWidth: "2px",
    zIndex: 1,
  },
  "&:active": {
    transform: "scale(1.05)",
  },
  // 데스크톱에서는 작은 크기
  "@media (min-width: 600px)": {
    width: "20px",
    height: "20px",
  },
}));

/**
 * 기본 필수 색상 팔레트 (빨주노초파남보 + 검정/흰색/회색)
 */
const BASIC_COLORS = [
  "#000000", // 검정
  "#FFFFFF", // 흰색
  "#808080", // 회색
  "#FF0000", // 빨강
  "#FF7F00", // 주황
  "#FFFF00", // 노랑
  "#00FF00", // 초록
  "#0000FF", // 파랑
  "#4B0082", // 남색
  "#9400D3", // 보라
];

/**
 * 리치 텍스트 에디터 컴포넌트
 * Tiptap 기반 WYSIWYG 에디터 (React 19 호환)
 */
const RichTextEditor = ({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
  height = 400,
  readOnly = false,
}: RichTextEditorProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  /**
   * 확장 기능 메모이제이션 (React 19 Strict Mode 중복 경고 방지)
   */
  const extensions = useMemo(
    () => [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "editor-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    []
  );

  const editor = useEditor(
    {
      extensions,
      content: value,
      editable: !readOnly,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          "data-placeholder": placeholder,
        },
      },
    },
    [extensions, readOnly, placeholder]
  );

  /**
   * value prop 변경 시 에디터 내용 업데이트
   */
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  /**
   * 색상 피커 외부 클릭 시 닫기
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker]);

  /**
   * 텍스트 색상 적용 핸들러
   */
  const applyColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  /**
   * 이미지 추가 핸들러
   */
  const addImage = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // 파일 크기 체크 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        alert("이미지 크기는 10MB 이하여야 합니다.");
        return;
      }

      // 이미지 타입 체크
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      try {
        // Base64로 변환
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          editor?.chain().focus().setImage({ src: base64 }).run();
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드에 실패했습니다.");
      }
    };
  };

  /**
   * 링크 추가 핸들러
   */
  const addLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL을 입력하세요:", previousUrl);

    // 취소한 경우
    if (url === null) {
      return;
    }

    // URL이 비어있으면 링크 제거
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // 링크 업데이트
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  /**
   * 표 삽입 핸들러
   */
  const insertTable = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  if (!editor) {
    return null;
  }

  return (
    <Box>
      {/* 툴바 */}
      {!readOnly && (
        <Toolbar>
          {/* 텍스트 스타일 */}
          <Tooltip title="굵게">
            <ToolbarButton
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "active" : ""}
            >
              <FormatBoldIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Tooltip title="기울임">
            <ToolbarButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "active" : ""}
            >
              <FormatItalicIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Tooltip title="밑줄">
            <ToolbarButton
              size="small"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive("underline") ? "active" : ""}
            >
              <FormatUnderlinedIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Tooltip title="취소선">
            <ToolbarButton
              size="small"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "active" : ""}
            >
              <StrikethroughSIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          {/* 텍스트 색상 */}
          <Box sx={{ position: "relative" }} ref={colorPickerRef}>
            <Tooltip title="텍스트 색상">
              <ToolbarButton
                size="small"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={showColorPicker ? "active" : ""}
              >
                <FormatColorTextIcon fontSize="small" />
              </ToolbarButton>
            </Tooltip>
            {showColorPicker && (
              <ColorPickerPopover>
                {/* 기본 색상 */}
                <ColorSectionTitle>색상 선택</ColorSectionTitle>
                <ColorGrid>
                  {BASIC_COLORS.map((color) => (
                    <ColorButton
                      key={color}
                      color={color}
                      onClick={() => applyColor(color)}
                      title={color}
                    />
                  ))}
                </ColorGrid>
              </ColorPickerPopover>
            )}
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* 정렬 */}
          <Tooltip title="왼쪽 정렬">
            <ToolbarButton
              size="small"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={editor.isActive({ textAlign: "left" }) ? "active" : ""}
            >
              <FormatAlignLeftIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Tooltip title="가운데 정렬">
            <ToolbarButton
              size="small"
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={
                editor.isActive({ textAlign: "center" }) ? "active" : ""
              }
            >
              <FormatAlignCenterIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Tooltip title="오른쪽 정렬">
            <ToolbarButton
              size="small"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={
                editor.isActive({ textAlign: "right" }) ? "active" : ""
              }
            >
              <FormatAlignRightIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* 리스트 */}
          <Tooltip title="순서 없는 목록">
            <ToolbarButton
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "active" : ""}
            >
              <FormatListBulletedIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Tooltip title="순서 있는 목록">
            <ToolbarButton
              size="small"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive("orderedList") ? "active" : ""}
            >
              <FormatListNumberedIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* 인용구, 코드 */}
          <Tooltip title="인용구">
            <ToolbarButton
              size="small"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive("blockquote") ? "active" : ""}
            >
              <FormatQuoteIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Tooltip title="코드 블록">
            <ToolbarButton
              size="small"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive("codeBlock") ? "active" : ""}
            >
              <CodeIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* 이미지, 링크 */}
          <Tooltip title="이미지 추가">
            <ToolbarButton size="small" onClick={addImage}>
              <ImageIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Tooltip title="링크 추가">
            <ToolbarButton
              size="small"
              onClick={addLink}
              className={editor.isActive("link") ? "active" : ""}
            >
              <LinkIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Tooltip title="표 삽입">
            <ToolbarButton
              size="small"
              onClick={insertTable}
              className={editor.isActive("table") ? "active" : ""}
            >
              <TableChartIcon fontSize="small" />
            </ToolbarButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* 실행 취소/재실행 */}
          <Tooltip title="실행 취소">
            <span>
              <ToolbarButton
                size="small"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <UndoIcon fontSize="small" />
              </ToolbarButton>
            </span>
          </Tooltip>

          <Tooltip title="재실행">
            <span>
              <ToolbarButton
                size="small"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <RedoIcon fontSize="small" />
              </ToolbarButton>
            </span>
          </Tooltip>
        </Toolbar>
      )}

      {/* 에디터 */}
      <EditorContainer height={height}>
        <EditorContent editor={editor} />
      </EditorContainer>
    </Box>
  );
};

export default RichTextEditor;
