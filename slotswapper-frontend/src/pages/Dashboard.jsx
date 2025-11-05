// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import moment from 'moment';
import EventForm from '../components/EventForm'; // Import the new component

const EventItem = ({ event, fetchEvents }) => {
  const isSwappable = event.status === 'SWAPPABLE';
  const isBusy = event.status === 'BUSY';
  const isPending = event.status === 'SWAP_PENDING';

  const toggleSwappable = async () => {
    const newStatus = isBusy ? 'SWAPPABLE' : 'BUSY';
    try {
      await api.put(`/events/${event._id}`, { status: newStatus });
      alert(`Status changed to ${newStatus}`);
      fetchEvents();
    } catch (error) {
      alert('Error updating status.');
      console.error(error);
    }
  };

  let borderColor = 'border-l-blue-600';
  if (isSwappable) borderColor = 'border-l-orange-500';
  if (isPending) borderColor = 'border-l-yellow-500';

  return (
    <div className={`bg-white p-5 rounded-lg shadow-md border-l-4 ${borderColor} hover:shadow-lg transition-shadow`}>
      <div className="text-lg font-semibold mb-2">{event.title}</div>
      <div className="text-sm text-gray-600 mb-4">
        {moment(event.startTime).format('LLL')} - {moment(event.endTime).format('LT')}
      </div>
      <p className="mb-3">Status: <strong>{event.status}</strong></p>

      {(isBusy || isSwappable) && (
        <button
          onClick={toggleSwappable}
          className={`mt-3 px-4 py-2 rounded-md font-medium transition-colors ${
            isBusy
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isBusy ? 'Make Swappable' : 'Set Back to Busy'}
        </button>
      )}
      {isPending && <p className="text-orange-600 font-bold mt-3">Awaiting swap response...</p>}
    </div>
  );
};

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // State for modal/form

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      setEvents(res.data.data);
    } catch (error) {
      alert('Failed to fetch events.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <div>Loading Calendar...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📅 My Calendar & Events</h2>
      <div className="flex justify-between items-center mb-6">
        <p className="text-lg">Total Events: <strong>{events.length}</strong></p>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Create New Event
        </button>
      </div>

      {showForm && <EventForm fetchEvents={fetchEvents} toggleForm={setShowForm} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {events.map(event => (
          <EventItem key={event._id} event={event} fetchEvents={fetchEvents} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
