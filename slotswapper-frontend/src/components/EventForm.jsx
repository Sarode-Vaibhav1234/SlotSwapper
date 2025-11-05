// src/components/EventForm.jsx
import React, { useState } from 'react';
import api from '../utils/api';
import moment from 'moment';

const EventForm = ({ fetchEvents, toggleForm }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(moment().format('YYYY-MM-DDTHH:mm'));
  const [endTime, setEndTime] = useState(moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Convert local datetime strings to UTC ISO format for the backend
    const eventData = {
        title,
        startTime: moment(startTime).toISOString(),
        endTime: moment(endTime).toISOString(),
        // status defaults to BUSY on backend
    };

    try {
      await api.post('/events', eventData);
      alert('Event created successfully!');
      fetchEvents(); // Refresh dashboard list
      toggleForm(false); // Close the form
    } catch (error) {
      alert(`Error creating event: ${error.response?.data?.error || 'Server error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-6">Create New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2 font-medium">Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Start Time:</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">End Time:</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Event'}
                    </button>
                    <button
                        type="button"
                        onClick={() => toggleForm(false)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default EventForm;