import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIAnalytics from '../AIAnalytics';
import * as api from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api');

describe('AIAnalytics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with initial state', () => {
    render(<AIAnalytics />);
    
    // Check for main headings
    expect(screen.getByText('Análisis con IA')).toBeInTheDocument();
    expect(screen.getByText('Pronóstico de Demanda')).toBeInTheDocument();
    expect(screen.getByText('Recomendaciones de Precios')).toBeInTheDocument();
    
    // Check for request buttons
    expect(screen.getByText('Solicitar Pronóstico')).toBeInTheDocument();
    expect(screen.getByText('Solicitar Recomendaciones')).toBeInTheDocument();
  });

  it('displays loading state when fetching demand forecast', async () => {
    // Mock API call to delay response
    (api.getDemandForecast as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<AIAnalytics />);
    
    const forecastButton = screen.getByText('Solicitar Pronóstico');
    fireEvent.click(forecastButton);
    
    // Check for loading state
    expect(screen.getByText('Analizando...')).toBeInTheDocument();
    expect(screen.getByText('Analizando historial de pedidos con IA...')).toBeInTheDocument();
  });

  it('displays forecast results when API call succeeds', async () => {
    const mockForecast = {
      forecast: [
        { product: 'Helado de Vainilla', day: '2024-01-15', quantity: 10 },
        { product: 'Torta de Chocolate', day: '2024-01-16', quantity: 5 },
      ]
    };

    (api.getDemandForecast as jest.Mock).mockResolvedValue(mockForecast);

    render(<AIAnalytics />);
    
    const forecastButton = screen.getByText('Solicitar Pronóstico');
    fireEvent.click(forecastButton);
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Helado de Vainilla')).toBeInTheDocument();
      expect(screen.getByText('Torta de Chocolate')).toBeInTheDocument();
      // Check that quantities are displayed (using getAllByText since they may appear multiple times)
      expect(screen.getAllByText(/10/)).toHaveLength(expect.any(Number));
      expect(screen.getAllByText(/5/)).toHaveLength(expect.any(Number));
    });
  });

  it('displays error message when forecast API call fails', async () => {
    const errorMessage = 'Insufficient order history. At least 7 days of data required for accurate forecasting.';
    const error: any = new Error(errorMessage);
    error.response = { data: { error: errorMessage } };

    (api.getDemandForecast as jest.Mock).mockRejectedValue(error);

    render(<AIAnalytics />);
    
    const forecastButton = screen.getByText('Solicitar Pronóstico');
    fireEvent.click(forecastButton);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Error al obtener pronóstico')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays loading state when fetching price recommendations', async () => {
    // Mock API call to delay response
    (api.getPriceRecommendations as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<AIAnalytics />);
    
    const recommendationsButton = screen.getAllByText('Solicitar Recomendaciones')[0];
    fireEvent.click(recommendationsButton);
    
    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText('Analizando precios y márgenes con IA...')).toBeInTheDocument();
    });
  });

  it('displays price recommendations when API call succeeds', async () => {
    const mockRecommendations = {
      recommendations: [
        {
          product: 'Helado de Vainilla',
          currentPrice: 100,
          suggestedPrice: 110,
          reason: 'Production costs increased, margin dropped to 25%'
        },
        {
          product: 'Torta de Chocolate',
          currentPrice: 200,
          suggestedPrice: 200,
          reason: 'Mantener precio actual - margen saludable'
        },
      ]
    };

    (api.getPriceRecommendations as jest.Mock).mockResolvedValue(mockRecommendations);

    render(<AIAnalytics />);
    
    const recommendationsButton = screen.getAllByText('Solicitar Recomendaciones')[0];
    fireEvent.click(recommendationsButton);
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Helado de Vainilla')).toBeInTheDocument();
      expect(screen.getByText('Torta de Chocolate')).toBeInTheDocument();
      // Check that prices are displayed (using getAllByText since they may appear multiple times)
      expect(screen.getAllByText(/\$100\.00/)).toHaveLength(expect.any(Number));
      expect(screen.getAllByText(/\$110\.00/)).toHaveLength(expect.any(Number));
      expect(screen.getAllByText(/\$200\.00/)).toHaveLength(expect.any(Number));
    });
  });

  it('displays error message when recommendations API call fails', async () => {
    const errorMessage = 'No products with production cost data found';
    const error: any = new Error(errorMessage);
    error.response = { data: { error: errorMessage } };

    (api.getPriceRecommendations as jest.Mock).mockRejectedValue(error);

    render(<AIAnalytics />);
    
    const recommendationsButton = screen.getAllByText('Solicitar Recomendaciones')[0];
    fireEvent.click(recommendationsButton);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Error al obtener recomendaciones')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('allows retry after error', async () => {
    const errorMessage = 'AI service temporarily unavailable';
    const error: any = new Error(errorMessage);
    error.response = { data: { error: errorMessage } };

    (api.getDemandForecast as jest.Mock).mockRejectedValueOnce(error);

    render(<AIAnalytics />);
    
    const forecastButton = screen.getByText('Solicitar Pronóstico');
    fireEvent.click(forecastButton);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByText('Reintentar');
    expect(retryButton).toBeInTheDocument();
    
    // Mock successful response for retry
    const mockForecast = {
      forecast: [
        { product: 'Helado de Vainilla', day: '2024-01-15', quantity: 10 },
      ]
    };
    (api.getDemandForecast as jest.Mock).mockResolvedValue(mockForecast);
    
    fireEvent.click(retryButton);
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Helado de Vainilla')).toBeInTheDocument();
    });
  });

  it('highlights products with price changes correctly', async () => {
    const mockRecommendations = {
      recommendations: [
        {
          product: 'Producto A',
          currentPrice: 100,
          suggestedPrice: 110,
          reason: 'Aumentar precio'
        },
        {
          product: 'Producto B',
          currentPrice: 100,
          suggestedPrice: 90,
          reason: 'Reducir precio'
        },
        {
          product: 'Producto C',
          currentPrice: 100,
          suggestedPrice: 100,
          reason: 'Mantener precio actual'
        },
      ]
    };

    (api.getPriceRecommendations as jest.Mock).mockResolvedValue(mockRecommendations);

    render(<AIAnalytics />);
    
    const recommendationsButton = screen.getAllByText('Solicitar Recomendaciones')[0];
    fireEvent.click(recommendationsButton);
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Producto A')).toBeInTheDocument();
      expect(screen.getByText('Producto B')).toBeInTheDocument();
      expect(screen.getByText('Producto C')).toBeInTheDocument();
      
      // Check for badges (without arrows)
      expect(screen.getByText('Aumentar')).toBeInTheDocument();
      expect(screen.getByText('Reducir')).toBeInTheDocument();
      // The "Mantener precio" text appears in multiple places, so just check it exists
      expect(screen.getAllByText(/Mantener precio/)).toHaveLength(expect.any(Number));
    });
  });
});
