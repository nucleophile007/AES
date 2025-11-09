import { useState } from 'react';

interface MessageDebuggerProps {
  studentId?: number;
  teacherId?: number;
  messages?: any[];
  error?: string;
  isLoading?: boolean;
  refreshCallback?: () => void;
}

const MessageDebugger = ({
  studentId,
  teacherId,
  messages = [],
  error,
  isLoading,
  refreshCallback
}: MessageDebuggerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDebugger = () => {
    setIsExpanded(!isExpanded);
  };

  const fetchDebugMessages = async () => {
    // Only show if both IDs are available
    if (!studentId || !teacherId) {
      alert('Both student and teacher IDs are required');
      return;
    }
    
    try {
      const response = await fetch(`/api/debug/messages?studentId=${studentId}&teacherId=${teacherId}`);
      const data = await response.json();
      
      console.log('Debug API response:', data);
      alert(`Found ${data.messages?.length || 0} messages in the database.\nCheck the console for details.`);
    } catch (err) {
      console.error('Debug fetch error:', err);
      alert('Error fetching debug messages. Check console for details.');
    }
  };

  const createTestMessage = () => {
    window.open(`/api/debug/create-message`, '_blank');
  };
  
  const viewAllMessages = () => {
    window.open(`/api/debug/view-messages`, '_blank');
  };
  
  const openDebugDashboard = () => {
    window.open(`/api/debug/dashboard`, '_blank');
  };

  if (!isExpanded) {
    return (
      <div 
        style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.7)', 
          color: '#fff',
          borderRadius: '4px',
          padding: '5px 10px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 9999
        }}
        onClick={toggleDebugger}
      >
        🐞 Debug
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        width: '300px',
        maxHeight: '500px',
        overflowY: 'auto',
        background: '#fff',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        borderRadius: '8px',
        padding: '15px',
        fontSize: '13px',
        zIndex: 9999
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Message Debugger</h3>
        <button 
          onClick={toggleDebugger}
          style={{ 
            background: 'transparent', 
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Status:</div>
        <div style={{ 
          padding: '5px',
          background: error ? '#fde8e8' : isLoading ? '#fef3c7' : '#e8f5e9',
          borderRadius: '4px',
          color: error ? '#b91c1c' : isLoading ? '#92400e' : '#1b5e20'
        }}>
          {error ? `Error: ${error}` : isLoading ? 'Loading...' : `Loaded ${messages.length} messages`}
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Connection Info:</div>
        <div style={{ fontSize: '12px' }}>
          <div>Student ID: {studentId || 'Not set'}</div>
          <div>Teacher ID: {teacherId || 'Not set'}</div>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Message Count: {messages.length}</div>
        {messages.length > 0 && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            Latest: {new Date(messages[0]?.createdAt).toLocaleString() || 'Unknown'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={fetchDebugMessages}
          disabled={!studentId || !teacherId}
          style={{ 
            padding: '8px',
            background: (!studentId || !teacherId) ? '#ccc' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!studentId || !teacherId) ? 'not-allowed' : 'pointer'
          }}
        >
          Check Database Messages
        </button>
        
        {refreshCallback && (
          <button 
            onClick={refreshCallback}
            style={{ 
              padding: '8px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Messages
          </button>
        )}
        
        <button 
          onClick={createTestMessage}
          style={{ 
            padding: '8px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create Test Message
        </button>
        
        <button 
          onClick={viewAllMessages}
          style={{ 
            padding: '8px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          View All Messages
        </button>
        
        <button 
          onClick={openDebugDashboard}
          style={{ 
            padding: '8px',
            background: '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Open Debug Dashboard
        </button>
      </div>
    </div>
  );
};

export default MessageDebugger;