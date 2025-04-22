import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Play, StopCircle, RefreshCw, Globe } from 'lucide-react';
import { recordingApi } from '../services/recording-api';
import { RecordingStatus } from '../types/recording';

const Recording: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('NeverStarted');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const status = await recordingApi.getStatus();
      
      // Validate the status is a proper RecordingStatus value
      if (typeof status === 'object' && status && 
          (status.status === 'NeverStarted' || 
           status.status === 'Recording' || 
           status.status === 'Stopped' || 
           status.status === 'Playing')) {
        setRecordingStatus(status.status);
        setError(null);
      } else {
        console.error('Invalid status received:', status);
        setError('Received invalid status from server');
      }
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Failed to fetch recording status');
      // Don't change the current status on error to avoid UI flickering
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      setIsLoading(true);
      await recordingApi.startRecording(targetUrl);
      setRecordingStatus('Recording');
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsLoading(true);
      await recordingApi.stopRecording();
      setRecordingStatus('Stopped');
      setError(null);
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Failed to stop recording');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPlayback = async () => {
    try {
      setIsLoading(true);
      await recordingApi.startPlayback();
      setRecordingStatus('Playing');
      setError(null);
    } catch (err) {
      console.error('Error starting playback:', err);
      setError('Failed to start playback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopPlayback = async () => {
    try {
      setIsLoading(true);
      await recordingApi.stopPlayback();
      setRecordingStatus('Stopped');
      setError(null);
    } catch (err) {
      console.error('Error stopping playback:', err);
      setError('Failed to stop playback');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: RecordingStatus) => {
    switch (status) {
      case 'Recording':
        return 'status-badge-recording';
      case 'Playing':
        return 'status-badge-playing';
      case 'Stopped':
        return 'status-badge-stopped';
      default:
        return 'status-badge-stopped';
    }
  };

  const getStatusDisplay = (status: RecordingStatus) => {
    // Ensure we only display valid status values
    const validStatuses: Record<RecordingStatus, string> = {
      'NeverStarted': 'Never Started',
      'Recording': 'Recording',
      'Stopped': 'Stopped',
      'Playing': 'Playing'
    };
    
    return validStatuses[status] || 'Unknown';
  };

  return (
    <div className="container">
      <div className="section-header">
        <h1 className="section-title">Record & Playback</h1>
        <p className="section-description">
          Record HTTP interactions and replay them as mock responses
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-brand-500">Recording Setup</h2>
            <span className={`status-badge ${getStatusColor(recordingStatus)} ml-2`}>
              {getStatusDisplay(recordingStatus)}
            </span>
          </div>
        </div>
        
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="targetUrl">Target URL</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <Globe className="h-4 w-4" />
              </div>
              <input
                type="text"
                id="targetUrl"
                className={`form-control ${!targetUrl && recordingStatus === 'NeverStarted' ? 'border-l-0' : ''}`}
                placeholder="Enter URL to record (e.g., https://api.example.com)"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                disabled={recordingStatus === 'Recording' || recordingStatus === 'Playing' || isLoading}
              />
            </div>
            <p className="help-text">The service you want to record interactions with</p>
          </div>

          <div className="form-grid mt-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-700">Recording Controls</h3>
              <div className="flex flex-wrap gap-2">
                {recordingStatus !== 'Recording' ? (
                  <button
                    className="btn-primary"
                    onClick={handleStartRecording}
                    disabled={!targetUrl || recordingStatus === 'Playing' || isLoading}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    className="btn-danger"
                    onClick={handleStopRecording}
                    disabled={isLoading}
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop Recording
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-700">Playback Controls</h3>
              <div className="flex flex-wrap gap-2">
                {recordingStatus !== 'Playing' ? (
                  <button
                    className="btn-secondary"
                    onClick={handleStartPlayback}
                    disabled={recordingStatus === 'Recording' || recordingStatus === 'NeverStarted' || isLoading}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Playback
                  </button>
                ) : (
                  <button
                    className="btn-danger"
                    onClick={handleStopPlayback}
                    disabled={isLoading}
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop Playback
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              <span className="font-medium">Status:</span> {getStatusDisplay(recordingStatus)}
              {isLoading && <span className="ml-2 text-xs text-neutral-500">(refreshing...)</span>}
            </div>
            <button 
              className="btn-secondary btn-sm"
              onClick={fetchStatus}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recording; 