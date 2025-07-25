import React from 'react';
import Navbar from '../components/Navbar';

const About = () => (
  <div style={{ background: '#181A1B', minHeight: '100vh' }}>
    <Navbar onSearch={() => {}} onLogout={() => {}} />
    <div style={containerStyle}>
      <h1 style={{ color: '#ff9800', fontSize: 36, marginBottom: 16 }}>About Smart.cart</h1>
      <p style={{ color: '#fff', fontSize: 20, maxWidth: 700, margin: '0 auto 32px auto' }}>
        Smart.cart is your one-stop destination for the latest and greatest in hardware tech products. Our mission is to make cutting-edge technology accessible, affordable, and enjoyable for everyone. Whether you're a gamer, creator, or tech enthusiast, we have something for you!
      </p>
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Our Vision</h2>
        <p style={sectionTextStyle}>
          We believe in empowering people through technology. Our platform is designed to offer a seamless shopping experience, curated product selections, and top-notch customer support.
        </p>
      </div>
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Meet the Team</h2>
        <p style={sectionTextStyle}>
          Smart.cart is built by a passionate team of tech lovers, engineers, and designers dedicated to bringing you the best in hardware innovation.
        </p>
      </div>
    </div>
  </div>
);

const containerStyle = {
  padding: '64px 24px',
  textAlign: 'center',
};
const sectionStyle = { margin: '40px auto', maxWidth: 700 };
const sectionTitleStyle = { color: '#ff9800', fontSize: 28, marginBottom: 10 };
const sectionTextStyle = { color: '#ccc', fontSize: 18 };

export default About; 