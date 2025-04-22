import React, { createContext, useContext, useState, useEffect } from 'react';
import { Stub, defaultStub } from '../types/stub';
import { getStubs, createStub, updateStub, deleteStub } from '../services/api';

interface StubContextProps {
  stubs: Stub[];
  loading: boolean;
  error: string | null;
  addStub: (stub: Stub) => Promise<void>;
  updateStub: (id: string, stub: Stub) => Promise<void>;
  removeStub: (id: string) => Promise<void>;
  getStubById: (id: string) => Stub | undefined;
  resetScenarios: () => Promise<void>;
}

const StubContext = createContext<StubContextProps>({
  stubs: [],
  loading: false,
  error: null,
  addStub: async () => {},
  updateStub: async () => {},
  removeStub: async () => {},
  getStubById: () => undefined,
  resetScenarios: async () => {},
});

export const useStubs = () => useContext(StubContext);

export const StubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stubs, setStubs] = useState<Stub[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStubs = async () => {
      try {
        setLoading(true);
        const data = await getStubs();
        setStubs(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch stubs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStubs();
  }, []);

  const addStub = async (stub: Stub) => {
    try {
      setLoading(true);
      const newStub = await createStub(stub);
      setStubs((prevStubs) => [...prevStubs, newStub]);
    } catch (err) {
      setError('Failed to add stub');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStubData = async (id: string, stub: Stub) => {
    try {
      setLoading(true);
      const updatedStub = await updateStub(id, stub);
      setStubs((prevStubs) => 
        prevStubs.map((s) => (s.id === id ? updatedStub : s))
      );
    } catch (err) {
      setError('Failed to update stub');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeStub = async (id: string) => {
    try {
      setLoading(true);
      await deleteStub(id);
      setStubs((prevStubs) => prevStubs.filter((s) => s.id !== id));
    } catch (err) {
      setError('Failed to delete stub');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStubById = (id: string) => {
    return stubs.find((stub) => stub.id === id);
  };

  const resetScenarios = async () => {
    try {
      setLoading(true);
      // API call to reset scenarios would go here
      setError(null);
    } catch (err) {
      setError('Failed to reset scenarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StubContext.Provider
      value={{
        stubs,
        loading,
        error,
        addStub,
        updateStub: updateStubData,
        removeStub,
        getStubById,
        resetScenarios,
      }}
    >
      {children}
    </StubContext.Provider>
  );
};