import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <Navbar expand="lg" style={{ backgroundColor: '#1f1f1f', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', transition: 'background-color 0.3s' }}>
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 'bold' }}>
          Banking App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" style={{ borderColor: '#fff' }} />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <Nav.Link
              as={Link}
              to="/"
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Home
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/transactions"
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Transaction History
            </Nav.Link>

            <NavDropdown
              title="Loan Application"
              id="loan-dropdown"
              style={dropdownStyle}
            >
              <NavDropdown.Item as={Link} to="/loan/home" style={itemStyle}>Home Loan</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/loan/general" style={itemStyle}>General Loan</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/loan/credit-card" style={itemStyle}>Credit Card</NavDropdown.Item>
            </NavDropdown>

            <Nav.Link
              as={Link}
              to="/prediction"
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Prediction Results
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/fairness"
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Fairness Mode
            </Nav.Link>

            <Nav.Link
            as={Link}
            to="/alternative-credit"
            style={linkStyle}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Alternative Credit Score
          </Nav.Link>


            <Nav.Link
              as={Link}
              to="/profile"
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Profile
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/logout"
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

const linkStyle = {
  color: '#fff',
  fontSize: '1.1rem',
  padding: '10px 15px',
  fontWeight: '500',
  transition: 'all 0.3s ease-in-out',
  textDecoration: 'none',
  borderRadius: '5px',
};

const dropdownStyle = {
  color: '#fff',
  fontSize: '1.1rem',
  fontWeight: '500',
  backgroundColor: '#1f1f1f',
  border: 'none',
  padding: '10px 15px',
  transition: 'all 0.3s ease-in-out',
};

const itemStyle = {
  color: '#333',
  padding: '10px 15px',
  fontSize: '1rem',
  textDecoration: 'none',
  transition: 'background-color 0.3s ease',
};

export default NavBar;
