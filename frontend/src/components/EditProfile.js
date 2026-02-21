import React, { useState, useRef } from "react";
import ImageEditor from "./ImageEditor";

function EditProfile({ profile, account, onSave, onClose }) {
  const [name, setName] = useState(profile?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [profilePic, setProfilePic] = useState(profile?.profilePic || "");
  const [coverPic, setCoverPic] = useState(profile?.coverPic || "");
  const fileRef = useRef(null);
  const coverRef = useRef(null);
  const [editingImage, setEditingImage] = useState(null); // { src, type: 'profile'|'cover' }

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditingImage({ src: reader.result, type });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleEditorSave = (editedBase64) => {
    if (editingImage.type === "profile") {
      setProfilePic(editedBase64);
    } else {
      setCoverPic(editedBase64);
    }
    setEditingImage(null);
  };

  const handleSave = () => {
    onSave(account, {
      name: name.trim() || "",
      bio: bio.trim() || "",
      location: location.trim() || "",
      profilePic,
      coverPic,
    });
    onClose();
  };

  const shortAddr = account ? account.slice(0, 6) + "..." + account.slice(-4) : "";

  return (
    <div className="edit-profile-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-profile-header">
          <button className="edit-profile-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <h3>Edit Profile</h3>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
        </div>

        <div
          className="edit-cover-area"
          onClick={() => coverRef.current?.click()}
          style={coverPic ? { backgroundImage: `url(${coverPic})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className={`edit-cover-overlay ${!coverPic ? 'visible' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>{coverPic ? 'Change cover photo' : 'Add a background photo'}</span>
          </div>
          <input ref={coverRef} type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, 'cover')} />
        </div>

        <div className="edit-avatar-section">
          <div
            className="edit-avatar"
            onClick={() => fileRef.current?.click()}
            style={profilePic ? { backgroundImage: `url(${profilePic})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            {!profilePic && (
              <span className="edit-avatar-letter">{account ? account.slice(2, 4).toUpperCase() : "?"}</span>
            )}
            <div className="edit-avatar-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, 'profile')} />
          </div>
        </div>

        <div className="edit-profile-fields">
          <div className="edit-field">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              maxLength={30}
            />
            <span className="edit-field-count">{name.length}/30</span>
          </div>

          <div className="edit-field">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about yourself"
              maxLength={160}
              rows={3}
            />
            <span className="edit-field-count">{bio.length}/160</span>
          </div>

          <div className="edit-field">
            <label>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you based?"
              maxLength={30}
            />
          </div>

          <div className="edit-field">
            <label>Wallet</label>
            <input type="text" value={shortAddr} disabled className="edit-field-disabled" />
          </div>
        </div>
        {editingImage && (
          <ImageEditor
            imageSrc={editingImage.src}
            onSave={handleEditorSave}
            onCancel={() => setEditingImage(null)}
            aspectHint={editingImage.type}
          />
        )}
      </div>
    </div>
  );
}

export default EditProfile;
