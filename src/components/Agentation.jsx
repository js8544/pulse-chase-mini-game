import { useState } from 'react';

function Agentation({ webhookUrl, onSubmit, disabled }) {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(4);
  const [status, setStatus] = useState('idle');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!message.trim()) {
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      await onSubmit({ message: message.trim(), rating, webhookUrl });
      setMessage('');
      setRating(4);
      setStatus('sent');
    } catch (error) {
      setStatus('failed');
    }
  }

  return (
    <section className="agentation-card" aria-label="Agentation feedback">
      <div className="agentation-header">
        <h2>Agentation Feedback</h2>
        <span className="agentation-badge">Integrated</span>
      </div>
      <p>Share quick feedback about this mini-game.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="agent-rating">Rating</label>
        <input
          id="agent-rating"
          type="range"
          min="1"
          max="5"
          step="1"
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          disabled={disabled || status === 'sending'}
        />
        <div className="rating-readout">{rating} / 5</div>

        <label htmlFor="agent-message">Message</label>
        <textarea
          id="agent-message"
          rows="3"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What felt good or frustrating?"
          disabled={disabled || status === 'sending'}
        />

        <button type="submit" disabled={disabled || status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Send Feedback'}
        </button>
      </form>
      {status === 'sent' && <p className="status success">Feedback sent to Agentation.</p>}
      {status === 'error' && <p className="status error">Please enter a message first.</p>}
      {status === 'failed' && <p className="status error">Could not send. Please try again.</p>}
      <small>Webhook: {webhookUrl}</small>
    </section>
  );
}

export default Agentation;
