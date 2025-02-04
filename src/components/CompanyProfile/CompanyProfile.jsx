import './CompanyProfile.css';

const CompanyProfile = ({ profile }) => {
  if (!profile) return null;

  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  return (
    <div className="company-profile">
      <div className="profile-header">
        <div className="profile-title">
          <h2>{profile.companyName}</h2>
          <p className="company-sector">{profile.sector} | {profile.industry}</p>
        </div>
        <div className="profile-price">
          <h3>${profile.price.toFixed(2)}</h3>
          <span className={`price-change ${profile.changes >= 0 ? 'positive' : 'negative'}`}>
            {profile.changes >= 0 ? '+' : ''}{profile.changes.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-item">
          <label>Market Cap</label>
          <span>${formatNumber(profile.mktCap)}</span>
        </div>
        <div className="profile-item">
          <label>Beta</label>
          <span>{profile.beta.toFixed(2)}</span>
        </div>
        <div className="profile-item">
          <label>Avg. Volume</label>
          <span>{formatNumber(profile.volAvg)}</span>
        </div>
        <div className="profile-item">
          <label>Last Dividend</label>
          <span>${profile.lastDiv}</span>
        </div>
        <div className="profile-item">
          <label>Range</label>
          <span>{profile.range}</span>
        </div>
        <div className="profile-item">
          <label>Exchange</label>
          <span>{profile.exchangeShortName}</span>
        </div>
      </div>

      <div className="profile-description">
        <h3>About {profile.companyName}</h3>
        <p>{profile.description}</p>
      </div>

      <div className="profile-footer">
        <div className="profile-info">
          <span>CEO: {profile.ceo}</span>
          <span>Country: {profile.country}</span>
          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="website-link">
            Visit Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
