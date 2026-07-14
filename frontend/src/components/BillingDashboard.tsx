import React, { useState, useEffect } from 'react';

interface BillingDashboardProps {
  token: string | null;
  subscriptionStatus: 'trial' | 'premium';
  trialEndsAt: string | null;
  onUpgradeSuccess: () => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  token,
  subscriptionStatus,
  trialEndsAt,
  onUpgradeSuccess,
}) => {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Countdown calculations
  const [daysLeft, setDaysLeft] = useState<number>(7);
  const [hoursLeft, setHoursLeft] = useState<number>(0);
  const [percentRemaining, setPercentRemaining] = useState<number>(100);

  useEffect(() => {
    if (subscriptionStatus === 'trial' && trialEndsAt) {
      const calculateTimeLeft = () => {
        const diffMs = new Date(trialEndsAt).getTime() - Date.now();
        if (diffMs <= 0) {
          setDaysLeft(0);
          setHoursLeft(0);
          setPercentRemaining(0);
          return;
        }

        const totalTrialMs = 7 * 24 * 60 * 60 * 1000;
        const currentRemainingMs = Math.max(0, Math.min(totalTrialMs, diffMs));
        const pct = (currentRemainingMs / totalTrialMs) * 100;
        setPercentRemaining(pct);

        const days = Math.floor(currentRemainingMs / (24 * 60 * 60 * 1000));
        const hours = Math.floor((currentRemainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        
        setDaysLeft(days);
        setHoursLeft(hours);
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 60000);
      return () => clearInterval(interval);
    }
  }, [subscriptionStatus, trialEndsAt]);

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMessage('Please enter a valid 16-digit card number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cardNumber, cardName }),
      });

      if (res.ok) {
        setSuccessMessage('Payment successful! Your account has been upgraded to Premium.');
        onUpgradeSuccess();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Payment processing failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="billing-dashboard-container animate-fade-in" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Left Side: Current Subscription details */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 className="section-title">💳 My Plan</h2>
            <p className="section-subtitle-text" style={{ marginBottom: '24px' }}>
              Manage subscription access states.
            </p>

            <div style={{ padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Plan
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: subscriptionStatus === 'premium' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                {subscriptionStatus === 'premium' ? 'Pro Member 🌟' : '7-Day Free Trial'}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                {subscriptionStatus === 'premium' ? 'Unlimited access to all registry catalog tools' : 'Evaluation sandbox period'}
              </div>
            </div>

            {subscriptionStatus === 'trial' && (
              <div className="trial-decay-timeline">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                  <span>Trial Period Decay</span>
                  <strong>{daysLeft}d {hoursLeft}h left</strong>
                </div>
                <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${percentRemaining}%`, background: 'var(--accent-gradient)', transition: 'width 0.5s ease-in-out' }}></div>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                  Your trial ends in {daysLeft} days. Upgrade to Premium now to avoid service interruptions.
                </p>
              </div>
            )}

            {subscriptionStatus === 'premium' && (
              <div style={{ borderLeft: '3px solid var(--success)', paddingLeft: '12px', marginTop: '16px' }}>
                <strong style={{ color: 'var(--success)', display: 'block', fontSize: '0.9rem' }}>Payment Status: Synchronized</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Next billing cycle: August 14, 2026.</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '30px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            🔒 Transactions are secured via encrypted mock gateways.
          </div>
        </div>

        {/* Right Side: Billing Form (only active for trial users) */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 className="section-title" style={{ fontSize: '1.3rem' }}>Upgrade to Premium</h3>
          <p className="section-subtitle-text" style={{ fontSize: '0.86rem', marginBottom: '20px' }}>
            Unlock unlimited stacks, custom workflows, and detailed reviews for <strong>$19/month</strong>.
          </p>

          {errorMessage && <div className="form-error-alert" style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.86rem' }}>⚠️ {errorMessage}</div>}
          {successMessage && <div className="form-success-alert" style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.86rem' }}>🎉 {successMessage}</div>}

          {subscriptionStatus === 'premium' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '3.5rem', marginBottom: '12px' }}>💎</span>
              <h4>You are a Premium Member</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>Thank you for supporting the AI Store registry catalog!</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribeSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem' }}>Cardholder Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Alan Turing"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem' }}>Card Number</label>
                <input
                  type="text"
                  maxLength={19}
                  className="form-control"
                  placeholder="e.g. 4111 2222 3333 4444"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Expiration Date</label>
                  <input
                    type="text"
                    maxLength={5}
                    className="form-control"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => {
                      const input = e.target.value.replace(/\D/g, '');
                      if (input.length <= 2) {
                        setCardExpiry(input);
                      } else {
                        setCardExpiry(`${input.slice(0, 2)}/${input.slice(2, 4)}`);
                      }
                    }}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    className="form-control"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={isLoading}>
                {isLoading ? 'Processing upgrade...' : '💳 Upgrade & Pay $19.00'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
