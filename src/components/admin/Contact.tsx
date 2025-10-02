import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Save } from 'lucide-react';

export default function Contact() {
  const [contactInfo, setContactInfo] = useState({
    phone1: '+57 (300) 123-4567',
    phone2: '+57 (300) 987-6543',
    email1: 'info@fastfooddeluxe.com',
    email2: 'pedidos@fastfooddeluxe.com',
    address: 'Av. Principal 123\nCentro Comercial Plaza\nBogotá, Colombia',
    hours1: 'Lunes - Viernes: 11:00 AM - 10:00 PM',
    hours2: 'Sábados - Domingos: 12:00 PM - 11:00 PM'
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+57 300 1234567',
      subject: 'Consulta sobre productos',
      message: 'Quisiera saber si tienen opciones vegetarianas en el menú.',
      date: '2023-05-15T14:30:00',
      read: true
    },
    {
      id: 2,
      name: 'Laura Gómez',
      email: 'laura@example.com',
      phone: '+57 300 7654321',
      subject: 'Problema con mi pedido',
      message: 'Mi pedido #12345 llegó incompleto, faltó una hamburguesa.',
      date: '2023-05-16T10:15:00',
      read: false
    },
    {
      id: 3,
      name: 'Carlos Martínez',
      email: 'carlos@example.com',
      phone: '+57 300 9876543',
      subject: 'Sugerencia',
      message: 'Me encantaría que incluyeran más opciones de postres en el menú.',
      date: '2023-05-16T16:45:00',
      read: false
    }
  ]);

  const [activeTab, setActiveTab] = useState('info');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value
    });
  };

  const handleSaveContactInfo = () => {
    // Aquí iría la lógica para guardar en la base de datos
    alert('Información de contacto actualizada correctamente');
    setIsEditing(false);
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    
    // Marcar como leído si no lo está
    if (!message.read) {
      setMessages(messages.map(m => 
        m.id === message.id ? {...m, read: true} : m
      ));
    }
  };

  const handleDeleteMessage = (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-6 font-medium text-sm ${activeTab === 'info' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Información de Contacto
          </button>
          <button
            onClick={() => {
              setActiveTab('messages');
              setSelectedMessage(null);
            }}
            className={`py-4 px-6 font-medium text-sm ${activeTab === 'messages' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Mensajes Recibidos
            <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
              {messages.filter(m => !m.read).length}
            </span>
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'info' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Información de Contacto</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Editar información
                </button>
              ) : (
                <button
                  onClick={handleSaveContactInfo}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save size={18} />
                  Guardar cambios
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-gray-800">Teléfonos</h3>
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="phone1"
                        value={contactInfo.phone1}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        name="phone2"
                        value={contactInfo.phone2}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600">{contactInfo.phone1}</p>
                      <p className="text-gray-600">{contactInfo.phone2}</p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-gray-800">Correos electrónicos</h3>
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="email"
                        name="email1"
                        value={contactInfo.email1}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="email"
                        name="email2"
                        value={contactInfo.email2}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600">{contactInfo.email1}</p>
                      <p className="text-gray-600">{contactInfo.email2}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-gray-800">Dirección</h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={contactInfo.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                    ></textarea>
                  ) : (
                    <p className="text-gray-600 whitespace-pre-line">{contactInfo.address}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-gray-800">Horarios</h3>
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="hours1"
                        value={contactInfo.hours1}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        name="hours2"
                        value={contactInfo.hours2}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600">{contactInfo.hours1}</p>
                      <p className="text-gray-600">{contactInfo.hours2}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Mensajes Recibidos</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h3 className="font-medium text-gray-700">Bandeja de entrada</h3>
                </div>
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div 
                        key={message.id}
                        onClick={() => handleViewMessage(message)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${!message.read ? 'bg-blue-50' : ''} ${selectedMessage?.id === message.id ? 'bg-gray-100' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className={`font-medium ${!message.read ? 'text-blue-600' : 'text-gray-800'}`}>
                            {message.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {new Date(message.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{message.subject}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{message.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No hay mensajes en la bandeja de entrada
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-2">
                {selectedMessage ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                      <h3 className="font-medium text-gray-700">{selectedMessage.subject}</h3>
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar mensaje
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-800">{selectedMessage.name}</h4>
                          <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                          <p className="text-sm text-gray-600">{selectedMessage.phone}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(selectedMessage.date)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line">{selectedMessage.message}</p>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                          onClick={() => window.location.href = `mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject}`}
                        >
                          Responder por correo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 text-center text-gray-500">
                    Selecciona un mensaje para ver su contenido
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}