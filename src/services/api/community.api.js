import { apiRequest } from "../api-client";

const COMMUNITY_BASE = "/api/community";

function appendFiles(formData, key, files) {
  files?.forEach((file) => formData.append(key, file));
}

function appendNumbers(formData, key, values) {
  values?.forEach((value) => formData.append(key, String(value)));
}

function createPostFormData(dto) {
  const formData = new FormData();
  formData.append("Content", dto.content);

  if (dto.title !== undefined && dto.title !== null) {
    formData.append("Title", dto.title);
  }

  appendFiles(formData, "Images", dto.images || dto.newImages);
  return formData;
}

function updatePostFormData(dto) {
  const formData = new FormData();

  if (dto.content !== undefined) {
    formData.append("Content", dto.content);
  }

  if (dto.title !== undefined && dto.title !== null) {
    formData.append("Title", dto.title);
  }

  appendFiles(formData, "NewImages", dto.newImages);
  appendNumbers(formData, "DeleteImageIds", dto.deleteImageIds);
  return formData;
}

function createCommentFormData(dto) {
  const formData = new FormData();
  formData.append("PostId", String(dto.postId));
  formData.append("Content", dto.content);

  if (dto.parentCommentId !== undefined && dto.parentCommentId !== null) {
    formData.append("ParentCommentId", String(dto.parentCommentId));
  }

  appendFiles(formData, "Images", dto.images);
  return formData;
}

function updateCommentFormData(dto) {
  const formData = new FormData();
  formData.append("Content", dto.content);
  appendFiles(formData, "NewImages", dto.newImages);
  appendNumbers(formData, "DeleteImageIds", dto.deleteImageIds);
  return formData;
}

export const communityApi = {
  getFeed: (params) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page);
    if (params?.size) query.append("size", params.size);
    const queryString = query.toString();
    const url = `${COMMUNITY_BASE}${queryString ? `?${queryString}` : ""}`;
    return apiRequest(url);
  },

  getPost: (id) => apiRequest(`${COMMUNITY_BASE}/${id}`),

  createPost: (dto) =>
    apiRequest(COMMUNITY_BASE, {
      method: "POST",
      body: createPostFormData(dto),
    }),

  updatePost: (id, dto) =>
    apiRequest(`${COMMUNITY_BASE}/${id}`, {
      method: "PUT",
      body: updatePostFormData(dto),
    }),

  deletePost: (id) =>
    apiRequest(`${COMMUNITY_BASE}/${id}`, {
      method: "DELETE",
    }),

  addPostImages: (id, dto) => {
    const formData = new FormData();
    appendFiles(formData, "images", dto.images);
    return apiRequest(`${COMMUNITY_BASE}/${id}/images`, {
      method: "POST",
      body: formData,
    });
  },

  deletePostImage: (id, imageId) =>
    apiRequest(`${COMMUNITY_BASE}/${id}/images/${imageId}`, {
      method: "DELETE",
    }),

  likePost: (id) =>
    apiRequest(`${COMMUNITY_BASE}/${id}/like`, {
      method: "POST",
    }),

  unlikePost: (id) =>
    apiRequest(`${COMMUNITY_BASE}/${id}/like`, {
      method: "DELETE",
    }),

  getComments: (id) => apiRequest(`${COMMUNITY_BASE}/${id}/comments`),

  createComment: (dto) =>
    apiRequest(`${COMMUNITY_BASE}/comments`, {
      method: "POST",
      body: createCommentFormData(dto),
    }),

  updateComment: (id, dto) =>
    apiRequest(`${COMMUNITY_BASE}/comments/${id}`, {
      method: "PUT",
      body: updateCommentFormData(dto),
    }),

  deleteComment: (id) =>
    apiRequest(`${COMMUNITY_BASE}/comments/${id}`, {
      method: "DELETE",
    }),

  likeComment: (id) =>
    apiRequest(`${COMMUNITY_BASE}/comments/${id}/like`, {
      method: "POST",
    }),

  unlikeComment: (id) =>
    apiRequest(`${COMMUNITY_BASE}/comments/${id}/like`, {
      method: "DELETE",
    }),
};
