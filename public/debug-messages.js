// Place this in your browser console to debug message visibility issues

const AESMessageDebugger = {
  // Check messages in the local state of React components
  async checkMessages() {
    console.log('🔍 AES Message Debugger');
    console.log('Checking for message components...');
    
    // Look for common message container classes
    const messageDivs = document.querySelectorAll('.messages, [class*="message"], [class*="chat"]');
    console.log(`Found ${messageDivs.length} potential message containers`);
    
    // Check React component state using React DevTools
    console.log('\nTo check React component state:');
    console.log('1. Open React DevTools');
    console.log('2. Select Components tab');
    console.log('3. Find StudentMessages or ChatDialog components');
    console.log('4. Look at the "messages" state array');
    
    return 'Use checkAPI(), checkDOM(), or checkStyles() for more specific checks';
  },

  // Check if any API requests for messages were made
  async checkAPI() {
    console.log('🔍 Checking recent message API calls...');
    
    try {
      // Fetch from debug API to see what's in the database
      const debugResponse = await fetch('/api/debug/messages');
      const debugData = await debugResponse.json();
      
      console.log('🗄️ Database Messages:', debugData);
      console.log(`Found ${debugData.messages?.length || 0} total messages in database`);
      
      return 'Check the network tab for any failed /api/messages/* requests';
    } catch (error) {
      console.error('Error checking debug API:', error);
      return 'Error connecting to debug API';
    }
  },
  
  // Check if messages exist in DOM but are hidden by CSS
  checkDOM() {
    console.log('🔍 Checking DOM for hidden messages...');
    
    // Look for message elements that might be hidden
    const messageElements = Array.from(document.querySelectorAll('[class*="message"], [class*="chat"] > div'));
    
    const hiddenMessages = messageElements.filter(el => {
      const style = window.getComputedStyle(el);
      return style.display === 'none' || 
             style.visibility === 'hidden' || 
             style.opacity === '0' || 
             parseFloat(style.opacity) === 0 ||
             el.offsetParent === null;
    });
    
    console.log(`Found ${hiddenMessages.length} hidden message-related elements`);
    
    if (hiddenMessages.length > 0) {
      console.log('Hidden elements:', hiddenMessages);
      return `${hiddenMessages.length} potentially hidden messages found`;
    }
    
    return 'No hidden message elements found';
  },
  
  // Check for CSS issues that might be hiding messages
  checkStyles() {
    console.log('🔍 Checking CSS styles affecting message visibility...');
    
    const relevantRules = [];
    
    // Check all style sheets for rules that might hide content
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          const selector = rule.selectorText || '';
          const cssText = rule.cssText || '';
          
          // Look for rules that might hide content
          if ((cssText.includes('display: none') || 
               cssText.includes('visibility: hidden') || 
               cssText.includes('opacity: 0')) && 
              (selector.includes('message') || 
               selector.includes('chat') || 
               selector.includes('dialog'))) {
            relevantRules.push({
              selector,
              cssText,
              source: sheet.href || 'inline style'
            });
          }
        }
      } catch (e) {
        // Cross-origin style sheets will throw an error
        console.log(`Could not access rules in ${sheet.href || 'a stylesheet'}`);
      }
    }
    
    console.log(`Found ${relevantRules.length} CSS rules that might affect message visibility`);
    console.table(relevantRules);
    
    return relevantRules.length > 0 ? 'Potential CSS visibility issues found' : 'No CSS visibility issues found';
  },

  // Helper to open the debug dashboard
  openDebugDashboard() {
    window.open('/api/debug/dashboard', '_blank');
    return 'Opening debug dashboard...';
  },
  
  // Helper to open message creator
  createTestMessage() {
    window.open('/api/debug/create-message', '_blank');
    return 'Opening test message creator...';
  },
  
  // Check a specific student-teacher conversation
  async checkConversation(studentId, teacherId) {
    if (!studentId || !teacherId) {
      return 'Please provide both studentId and teacherId';
    }
    
    console.log(`🔍 Checking conversation between student #${studentId} and teacher #${teacherId}...`);
    
    try {
      const response = await fetch(`/api/debug/messages?studentId=${studentId}&teacherId=${teacherId}`);
      const data = await response.json();
      
      console.log('Conversation data:', data);
      
      if (data.filteredMessages && data.filteredMessages.length > 0) {
        console.log(`Found ${data.filteredMessages.length} messages in this conversation`);
        data.filteredMessages.forEach((msg, i) => {
          console.log(`\n${i+1}) ${msg.senderRole} #${msg.senderId} → ${msg.recipientRole} #${msg.recipientId}`);
          console.log(`   "${msg.content}"`);
          console.log(`   (${new Date(msg.createdAt).toLocaleString()})`);
        });
        return `Found ${data.filteredMessages.length} messages between student #${studentId} and teacher #${teacherId}`;
      } else {
        return `No messages found between student #${studentId} and teacher #${teacherId}`;
      }
    } catch (error) {
      console.error('Error checking conversation:', error);
      return 'Error checking conversation';
    }
  },
  
  // Help text
  help() {
    console.log('\n📋 AES Message Debugger Help:');
    console.log('- AESMessageDebugger.checkMessages() - Check message components');
    console.log('- AESMessageDebugger.checkAPI() - Check message API calls');
    console.log('- AESMessageDebugger.checkDOM() - Check for hidden messages in DOM');
    console.log('- AESMessageDebugger.checkStyles() - Check CSS rules affecting visibility');
    console.log('- AESMessageDebugger.openDebugDashboard() - Open debug dashboard');
    console.log('- AESMessageDebugger.createTestMessage() - Create a test message');
    console.log('- AESMessageDebugger.checkConversation(studentId, teacherId) - Check specific conversation');
    
    return 'AES Message Debugger ready!';
  }
};

// Initialize and show help
console.log('%c AES Message Debugger Loaded! 🐛', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
AESMessageDebugger.help();

// Add to window for easy access
window.AESMessageDebugger = AESMessageDebugger;