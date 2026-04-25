import { useState, useRef, useEffect } from 'react';
import { dataService } from '../services/dataService';

type ChatbotMessage = {
  sender: 'user' | 'bot';
  text: string;
};

const getChatbotResponse = (message: string): string => {
  const query = message.trim().toLowerCase();
  const classrooms = dataService.getClassrooms();
  const total = classrooms.length;
  const available = classrooms.filter((room) => room.status === 'available').length;
  const occupied = classrooms.filter((room) => room.status === 'occupied').length;
  const unavailable = classrooms.filter((room) => room.status === 'unavailable').length;

  const numbers = classrooms.map((room) => room.roomNumber.toLowerCase());

  if (query.includes('available') && query.includes('count')) {
    return `There are ${available} available classrooms out of ${total}.`;
  }

  if (query.includes('occupied') && query.includes('count')) {
    return `There are ${occupied} occupied classrooms right now.`;
  }

  if (query.includes('unavailable') && query.includes('count')) {
    return `There are ${unavailable} unavailable classrooms.`;
  }

  if (query.includes('available')) {
    return `Currently ${available} classrooms are available, ${occupied} are occupied, and ${unavailable} are unavailable.`;
  }

  if (query.includes('occupied')) {
    return `Right now ${occupied} classrooms are occupied and ${available} are available.`;
  }

  if (query.includes('unavailable')) {
    return `There are ${unavailable} classrooms unavailable at the moment.`;
  }

  if (query.includes('total') || query.includes('how many classrooms')) {
    return `The school has ${total} classrooms in the system.`;
  }

  if (query.includes('department')) {
    const departmentMatch = query.match(/department\s+([a-z0-9 ]+)/);
    if (departmentMatch) {
      const department = departmentMatch[1].trim();
      const matches = classrooms.filter((room) =>
        room.department.toLowerCase().includes(department)
      );
      if (matches.length > 0) {
        return `There are ${matches.length} classrooms in the ${matches[0].department} department.`;
      }
      return `I could not find any classrooms for department '${department}'.`;
    }
    return `Ask me about classroom counts for a specific department, like chemistry or mathematics.`;
  }

  const roomNumberMatch = query.match(/room\s*(\d+)/);

  if (query.includes('course') || query.includes('courses')) {
    if (query.includes('what kind') || query.includes('available') || query.includes('offer') || query.includes('list') || query.includes('program') || query.includes('which')) {
      return `The school offers the following courses: DIT, BSE, BTVTED, BSMA, and DHRT.`;
    }
    // Handle simple "course" or "courses" queries
    return `The school offers the following courses: DIT, BSE, BTVTED, BSMA, and DHRT. For more details, try asking 'what courses are available?' or 'list all courses'.`;
  }
  if (roomNumberMatch) {
    const roomNumber = roomNumberMatch[1];
    const classroom = classrooms.find((room) => room.roomNumber === roomNumber);
    if (classroom) {
      return `Room ${classroom.roomNumber} is currently ${classroom.status}. ${classroom.reason ? `Reason: ${classroom.reason}.` : ''}`;
    }
    return `I could not find information for room ${roomNumber}.`;
  }

  if (query.includes('building')) {
    const buildingMatch = query.match(/building\s*([a-z0-9 ]+)/);
    if (buildingMatch) {
      const building = buildingMatch[1].trim();
      const matches = classrooms.filter((room) =>
        room.building.toLowerCase().includes(building)
      );
      if (matches.length > 0) {
        const availableInBuilding = matches.filter((room) => room.status === 'available').length;
        return `In ${matches[0].building}, there are ${matches.length} classrooms and ${availableInBuilding} of them are available.`;
      }
      return `I could not find any classrooms for building '${building}'.`;
    }
    return `Ask me about a specific building, for example 'building A'.`;
  }

  if (query.includes('dean') || query.includes('who is the dean')) {
    return `The dean of the College of Saint Amatiel Malabon City is Dr. Jeffrey T. Dela Cruz.`;
  }

  const isGrade11 = /grade\s*11|11th grade/.test(query);
  const isGrade12 = /grade\s*12|12th grade/.test(query);
  if (query.includes('requirements') || query.includes('required documents') || query.includes('enrollment requirements')) {
    if (isGrade11 || isGrade12 || query.includes('incoming') || query.includes('grade 11') || query.includes('grade 12')) {
      return `The requirements for incoming Grade 11 and 12 enrollment are:
1. Grade 10 Original Card
2. PSA (Photocopy)
3. Good Moral (Original)
4. 2x2 ID Picture
5. 1x1 ID Picture
6. Long Brown Envelope
7. Long White Envelope`;
    }
    // Handle general requirements query
    return `For enrollment requirements, please specify if you are an incoming Grade 11 or Grade 12 student. The requirements include: Grade 10 Original Card, PSA (Photocopy), Good Moral (Original), 2x2 ID Picture, 1x1 ID Picture, Long Brown Envelope, and Long White Envelope.`;
  }

  if (/contact|call|text|facebook|tiktok|inquiry|reach/.test(query)) {
    return `For inquiries, contact:
Call or Text: 0977-1518397
Facebook: https://facebook.com/CSAMalabonCity
TikTok: https://www.tiktok.com/amatielians`;
  }

  if (query.includes('where') && query.includes('located')) {
    return `The school is located at 118 Int. Gen. Luna St, Malabon City, 1470 Metro Manila.`;
  }

  if (query.includes('location') || query.includes('address') || query.includes('where') || query.includes('located')) {
    return `The school is located at 118 Int. Gen. Luna St, Malabon City, 1470 Metro Manila. View on Google Maps: https://www.google.com/maps/search/?api=1&query=118+Int.+Gen.+Luna+St,+Malabon+City`;
  }

  if (query.includes('school') || query.includes('information') || query.includes('info')) {
    return `I can tell you the number of available, occupied, and unavailable classrooms, or provide details for a specific room, building, or department.`;
  }

  if (numbers.some((num) => query.includes(num))) {
    const classroom = classrooms.find((room) => query.includes(room.roomNumber.toLowerCase()));
    if (classroom) {
      return `Room ${classroom.roomNumber} is ${classroom.status}. ${classroom.reason ? `Reason: ${classroom.reason}.` : ''}`;
    }
  }

  return `I can help with classroom availability, room status, building info, and department counts. Try asking: 'How many classrooms are available?' or 'What is room 101 status?'`;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatbotMessage[]>([
    {
      sender: 'bot',
      text: 'Hi! Ask me about classroom availability, room status, buildings, or departments.',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const botText = getChatbotResponse(userText);

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText },
      { sender: 'bot', text: botText },
    ]);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`w-[320px] ${isOpen ? 'h-[460px]' : 'h-14'} overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-300`}> 
        <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
          <div>
            <p className="font-semibold">School Chatbot</p>
            <p className="text-xs text-slate-300">Ask about classrooms and availability</p>
          </div>
          <button
            onClick={() => setIsOpen((open) => !open)}
            className="rounded-full bg-slate-700 p-2 hover:bg-slate-600"
            title={isOpen ? 'Close chatbot' : 'Open chatbot'}
          >
            {isOpen ? '×' : '💬'}
          </button>
        </div>

        {isOpen && (
          <div className="flex h-[calc(100%-56px)] flex-col bg-slate-50 px-4 py-3">
            <div className="mb-3 overflow-y-auto pr-2" style={{ flex: 1 }}>
              {messages.map((message, index) => (
                <div
                  key={`${message.sender}-${index}`}
                  className={`mb-3 flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    message.sender === 'bot'
                      ? 'bg-white text-slate-900'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question..."
                className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <button
                onClick={handleSend}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
