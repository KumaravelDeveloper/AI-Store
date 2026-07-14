import React, { useState } from 'react';

interface SubmitFormProps {
  onSubmitSuggestion: (formData: any) => Promise<boolean>;
}

export const SubmitForm: React.FC<SubmitFormProps> = ({ onSubmitSuggestion }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState('free');
  const [platform, setPlatform] = useState('Web');
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !url || !description) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      name,
      email,
      website_url: url,
      description,
      pricing_type: priceType,
      platform,
      categories,
      tags,
    };

    const isOk = await onSubmitSuggestion(payload);
    setIsSubmitting(false);

    if (isOk) {
      setSuccess(true);
      setName('');
      setEmail('');
      setUrl('');
      setDescription('');
      setCategories('');
      setTags('');
    } else {
      setErrorMsg('Failed to submit. Please check connection and try again.');
    }
  };

  return (
    <div className="submit-form-container glass-panel animate-fade-in">
      {success ? (
        <div className="submit-success-state text-center">
          <span className="success-icon">🎉</span>
          <h2 className="success-title">Thank You!</h2>
          <p className="success-desc">
            Your tool suggestion has been submitted successfully. Our administrators will review and approve it shortly.
          </p>
          <button className="btn btn-primary" onClick={() => setSuccess(false)}>
            Submit Another Tool
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="submit-tool-form">
          <div className="submit-form-header">
            <h2 className="submit-title">🚀 Suggest an AI Tool</h2>
            <p className="submit-subtitle">
              Discovered a awesome new AI tool? Help the community find it by submitting it to AI Compass.
            </p>
          </div>

          {errorMsg && <div className="form-error-alert">⚠️ {errorMsg}</div>}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Tool Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Cursor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website URL *</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Contact Email *</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pricing Type</label>
              <select
                className="form-control"
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
              >
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Supported Platforms (e.g. Web, Desktop)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Web, iOS, MacOS"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Suggested Categories (comma separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Design, Coding, Automation"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Suggested Tags (comma separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Logo, Web Design, Auto-complete"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Description & Key Features *</label>
              <textarea
                className="form-control"
                placeholder="Provide a short, clear description of the tool's main features and what it helps accomplish..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <div className="submit-footer">
            <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
