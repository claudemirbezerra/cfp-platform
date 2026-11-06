import { EventDTO, sharedTypes } from './shared-types';

describe('sharedTypes', () => {
  it('should work', () => {
    expect(sharedTypes()).toEqual('shared-types');
  });

  it('should support EventDTO type structure', () => {
    const event: EventDTO = {
      id: 'event-1',
      nome: 'Conferência Tech 2026',
      endereco: 'Av. Paulista, 1000 - São Paulo, SP',
      capacidade: 500,
      data: '2026-11-20',
    };
    expect(event.nome).toBe('Conferência Tech 2026');
    expect(event.capacidade).toBe(500);
  });
});
