import { apiClient } from "./client";

export type BoardCategory = "notice" | "free" | "humor" | "knowledge";

export interface PostAuthor {
  id: number;
  nickname: string;
  avatarUrl?: string; // 레거시 필드 (제거 예정)
  profileImageUrl?: string; // R2 버킷의 프로필 이미지 URL (Presigned URL로 변환 필요)
}

export interface Post {
  id: number;
  category: string; // 백엔드에서 "NOTICE" 형식으로 반환
  title: string;
  content?: string; // 목록에서는 없을 수 있음
  author: PostAuthor;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  isLiked?: boolean;
  isNew?: boolean; // 프론트엔드에서 계산
}

export interface Comment {
  id: number;
  content: string;
  author: PostAuthor;
  parentId: number | null;
  createdAt: string;
  children: Comment[]; // 계층 구조의 대댓글
  deleted: boolean; // 백엔드에서 deleted로 반환
}

export interface PostListParams {
  category?: string; // 백엔드 ENUM 형식 ("NOTICE", "FREE" 등)
  page?: number;
  limit?: number;
  sort?: "latest" | "popular";
}

export interface PostListResponse {
  data: Post[];
  meta: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface CreatePostRequest {
  category: string; // 백엔드 ENUM 형식 ("NOTICE", "FREE" 등)
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  category?: string; // 백엔드 ENUM 형식 ("NOTICE", "FREE" 등)
  title?: string;
  content?: string;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number | null;
}

export const boardApi = {
  // Posts
  getPosts: (params?: PostListParams) => {
    return apiClient.get<PostListResponse>("/posts", { params });
  },

  getPostDetail: (id: number) => {
    return apiClient.get<Post>(`/posts/${id}`);
  },

  createPost: (data: CreatePostRequest) => {
    return apiClient.post<Post>("/posts", data);
  },

  updatePost: (id: number, data: UpdatePostRequest) => {
    return apiClient.put<Post>(`/posts/${id}`, data);
  },

  deletePost: (id: number) => {
    return apiClient.delete<void>(`/posts/${id}`);
  },

  likePost: (id: number) => {
    return apiClient.post<{ liked: boolean; totalLikes: number }>(
      `/posts/${id}/like`
    );
  },

  // Comments
  getComments: (postId: number) => {
    return apiClient.get<Comment[]>(`/posts/${postId}/comments`);
  },

  createComment: (postId: number, data: CreateCommentRequest) => {
    return apiClient.post<Comment>(`/posts/${postId}/comments`, data);
  },

  deleteComment: (commentId: number) => {
    return apiClient.delete<void>(`/comments/${commentId}`);
  },
};
