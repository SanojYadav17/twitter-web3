import React, { useState, useRef } from "react";
import { getProfilePic } from "../helpers/profile";
import { AI_OPTIONS, generateContent } from "../helpers/ai";
import { uploadImage } from "../helpers/cloudinary";
import ImageEditor from "./ImageEditor";

function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = (h * maxWidth) / w;
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function CreateTweet({ postTweet, account, profiles }) {
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [imageData, setImageData] = useState(null); // { base64, name, size }
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const textareaRef = useRef(null);
  const aiMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const maxLen = 280;
  const profilePic = getProfilePic(account, profiles);

  const [uploading, setUploading] = useState(false);

  // Count UTF-8 bytes (same as Solidity's bytes().length)
  const byteLen = new TextEncoder().encode(content).length;
  const imgRefEstimate = imageData ? 50 : 0; // ~50 bytes for "\n[IMG]cloud:tweeter/tweets/xxxxx.jpg"
  const totalBytes = byteLen + imgRefEstimate;
  const pct = (totalBytes / maxLen) * 100;
  const remaining = maxLen - totalBytes;

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select an image file (jpg, png, gif, webp)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }
    setError("");
    try {
      const base64 = await compressImage(file);
      setRawImage(base64);
      setImageData({ base64, name: file.name, size: file.size });
      setShowEditor(true);
    } catch (err) {
      setError("Failed to process image");
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const removeImage = () => {
    setImageData(null);
    setRawImage(null);
    setShowImageUpload(false);
  };

  const handleEditorSave = (editedBase64) => {
    setImageData(prev => ({ ...prev, base64: editedBase64 }));
    setShowEditor(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setError("");
    try {
      let finalContent = content;
      if (imageData) {
        setUploading(true);
        const shortRef = await uploadImage(imageData.base64, "tweets");
        setUploading(false);
        finalContent = content + "\n[IMG]" + shortRef;
      }
      // Check actual byte length before sending to contract
      const finalBytes = new TextEncoder().encode(finalContent).length;
      if (finalBytes > maxLen) {
        throw new Error(`Tweet is ${finalBytes} bytes (max ${maxLen}). Shorten your text or remove the image.`);
      }
      await postTweet(finalContent);
      setContent("");
      setImageData(null);
      setShowImageUpload(false);
    } catch (err) {
      setUploading(false);
      setError("Tweet failed: " + (err.reason || err.message));
    }
    setPosting(false);
  };

  const autoResize = (e) => {
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    setContent(ta.value);
  };

  const handleAiOption = (fn) => {
    if (content.trim()) {
      setContent(fn(content));
    }
    setShowAiMenu(false);
  };

  const handleGenerate = () => {
    setContent(generateContent(genTopic || 'Web3'));
    setGenTopic("");
    setShowGenerate(false);
    setShowAiMenu(false);
  };

  return (
    <div className="create-tweet">
      <form onSubmit={handleSubmit}>
        <div className="create-tweet-body">
          <div className="tweet-avatar small">
            {profilePic ? (
              <img src={profilePic} alt="" className="avatar-img" />
            ) : (
              account ? account.slice(2, 4).toUpperCase() : "?"
            )}
          </div>
          <div className="create-tweet-input-wrap">
            <textarea
              ref={textareaRef}
              placeholder="What's happening on-chain?"
              value={content}
              onChange={autoResize}
              maxLength={maxLen}
              rows={2}
            />
            {showImageUpload && !imageData && (
              <div
                className={`image-upload-area ${dragging ? "dragging" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <div className="image-upload-text">
                  <p>Click to upload or drag & drop</p>
                  <span>JPG, PNG, GIF, WEBP (max 5MB)</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: "none" }}
                  onChange={handleFileInput}
                />
              </div>
            )}
            {imageData && (
              <div className="image-preview-card">
                <img src={imageData.base64} alt="Preview" className="preview-card-img" />
                <div className="preview-card-actions">
                  <button type="button" className="preview-action-btn" onClick={() => setShowEditor(true)} title="Edit image">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button type="button" className="preview-action-btn remove" onClick={removeImage} title="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {showEditor && rawImage && (
              <ImageEditor
                imageSrc={rawImage}
                onSave={handleEditorSave}
                onCancel={() => setShowEditor(false)}
              />
            )}
          </div>
        </div>
        <div className="create-tweet-footer">
          <div className="create-tweet-tools">
            <button
              type="button"
              className={`tool-btn ${imageData ? 'active' : ''}`}
              title="Upload image"
              onClick={() => {
                if (imageData) {
                  removeImage();
                } else {
                  setShowImageUpload(!showImageUpload);
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>

            <div className="ai-menu-wrap" ref={aiMenuRef}>
              <button
                type="button"
                className="tool-btn ai-btn"
                title="AI Enhance"
                onClick={() => { setShowAiMenu(!showAiMenu); setShowGenerate(false); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span className="ai-label">AI</span>
              </button>
              {showAiMenu && (
                <div className="ai-dropdown">
                  <div className="ai-dropdown-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                    AI Assistant
                  </div>

                  <div className="ai-category-label">Writing Style</div>
                  {AI_OPTIONS.filter(o => o.category === 'style').map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className="ai-option"
                      onClick={() => handleAiOption(opt.fn)}
                      disabled={!content.trim()}
                    >
                      <span className="ai-option-label">{opt.label}</span>
                      <span className="ai-option-desc">{opt.desc}</span>
                    </button>
                  ))}

                  <div className="ai-category-label">Tools</div>
                  {AI_OPTIONS.filter(o => o.category === 'tools').map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className="ai-option"
                      onClick={() => handleAiOption(opt.fn)}
                      disabled={!content.trim()}
                    >
                      <span className="ai-option-label">{opt.label}</span>
                      <span className="ai-option-desc">{opt.desc}</span>
                    </button>
                  ))}

                  <div className="ai-category-label">Engagement</div>
                  {AI_OPTIONS.filter(o => o.category === 'engage').map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className="ai-option"
                      onClick={() => handleAiOption(opt.fn)}
                      disabled={!content.trim()}
                    >
                      <span className="ai-option-label">{opt.label}</span>
                      <span className="ai-option-desc">{opt.desc}</span>
                    </button>
                  ))}

                  <div className="ai-category-label">Translate</div>
                  {AI_OPTIONS.filter(o => o.category === 'translate').map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className="ai-option"
                      onClick={() => handleAiOption(opt.fn)}
                      disabled={!content.trim()}
                    >
                      <span className="ai-option-label">{opt.label}</span>
                      <span className="ai-option-desc">{opt.desc}</span>
                    </button>
                  ))}
                  <div className="ai-divider"></div>
                  <button
                    type="button"
                    className="ai-option ai-generate"
                    onClick={() => setShowGenerate(!showGenerate)}
                  >
                    <span className="ai-option-label">🤖 Generate</span>
                    <span className="ai-option-desc">Create a new tweet</span>
                  </button>
                  {showGenerate && (
                    <div className="ai-generate-input">
                      <input
                        type="text"
                        placeholder="Topic (e.g. Web3, AI, Crypto)..."
                        value={genTopic}
                        onChange={(e) => setGenTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      />
                      <button type="button" className="btn btn-primary btn-sm" onClick={handleGenerate}>Go</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="char-divider"></div>
            <div className="char-ring" data-warn={remaining <= 20 ? "true" : undefined}>
              <svg viewBox="0 0 36 36" className="char-svg">
                <circle cx="18" cy="18" r="15.5" className="char-bg" />
                <circle
                  cx="18" cy="18" r="15.5"
                  className={`char-fill ${pct > 90 ? "warn" : ""}`}
                  strokeDasharray={`${pct} 100`}
                />
              </svg>
              <span className={`char-num ${remaining <= 20 ? "warn" : ""}`}>
                {remaining}
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary tweet-submit-btn"
            disabled={posting || uploading || !content.trim() || remaining < 0}
          >
            {(posting || uploading) ? (
              <span className="btn-loading">
                <span className="btn-spinner"></span> {uploading ? 'Uploading...' : 'Posting...'}
              </span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Tweet
              </>
            )}
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}

export default CreateTweet;
