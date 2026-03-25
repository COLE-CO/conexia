import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { AuthContext } from '../context/AuthContext';
import { login } from '../services/authService';

const navigateMock = vi.fn();
const loginMock = vi.mocked(login);

vi.mock('../services/authService', () => ({
  login: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function renderPage() {
  const loginState = vi.fn().mockResolvedValue(undefined);

  render(
    <AuthContext.Provider
      value={{
        user: null,
        isAuthenticated: false,
        loading: false,
        loginState,
        logout: vi.fn(),
        refreshUser: vi.fn(),
        patchUser: vi.fn(),
        setUser: vi.fn(),
      }}
    >
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  return { loginState };
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('permite iniciar sesion y redirige al dashboard', async () => {
    const user = userEvent.setup();
    const { loginState } = renderPage();
    loginMock.mockResolvedValue({ access_token: 'token-123' });

    await user.type(screen.getByLabelText(/correo/i), 'admin@test.com');
    await user.type(screen.getByLabelText(/contrase/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /acceder/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('admin@test.com', 'secret123');
      expect(loginState).toHaveBeenCalledWith('token-123');
      expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('muestra error cuando las credenciales fallan', async () => {
    const user = userEvent.setup();
    renderPage();
    loginMock.mockRejectedValue(new Error('unauthorized'));

    await user.type(screen.getByLabelText(/correo/i), 'admin@test.com');
    await user.type(screen.getByLabelText(/contrase/i), 'incorrecta');
    await user.click(screen.getByRole('button', { name: /acceder/i }));

    expect(
      await screen.findByText(
        /credenciales incorrectas o usuario no autorizado/i
      )
    ).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
