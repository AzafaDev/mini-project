import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEventStore } from '../stores/useEventStore';
import { formatDate } from '../lib/formatters';

const OrganizerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { organizerProfile, loading, error, fetchOrganizerProfile, clearOrganizerProfile } = useEventStore();
  
  const [activeTab, setActiveTab] = useState<'events' | 'reviews'>('events');

  useEffect(() => {
    if (id) {
      fetchOrganizerProfile(id);
    }
    return () => {
      clearOrganizerProfile();
    };
  }, [id]);

  if (loading && !organizerProfile) {
    return (
      <div className='bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-4 border-[#c0c1ff] border-t-transparent rounded-full animate-spin'></div>
          <p className='text-[#c7c4d8]'>Loading organizer profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <span className='material-symbols-outlined text-6xl text-[#93000a]'>
            error
          </span>
          <h2 className='text-2xl font-bold'>Failed to load organizer</h2>
          <p className='text-[#c7c4d8]'>{error}</p>
        </div>
      </div>
    );
  }

  if (!organizerProfile) {
    return (
      <div className='bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <span className='material-symbols-outlined text-6xl text-[#c7c4d8]'>
            person_off
          </span>
          <h2 className='text-2xl font-bold'>Organizer not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[#131313] text-[#e5e2e1] min-h-screen font-sans selection:bg-[#c0c1ff]/30'>
      <main className='pt-16 min-h-screen'>
        {/* Hero Section */}
        <section className='relative w-full h-[40vh] md:h-[300px] overflow-hidden bg-gradient-to-b from-[#1c1b1b] to-[#131313]'>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#353534] flex items-center justify-center overflow-hidden border-4 border-[#c0c1ff]/20'>
              {organizerProfile.imageUrl ? (
                <img
                  src={organizerProfile.imageUrl}
                  alt={organizerProfile.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <span className='material-symbols-outlined text-6xl text-[#c7c4d8]'>
                  person
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Profile Info */}
        <div className='px-8 py-8 max-w-4xl mx-auto text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-4'
          >
            <h1 className='text-3xl md:text-4xl font-black tracking-tighter text-[#e5e2e1]'>
              {organizerProfile.name}
            </h1>
            
            <p className='text-[#c7c4d8] text-sm'>
              Member since {formatDate(organizerProfile.createdAt)}
            </p>

            {/* Stats */}
            <div className='flex justify-center gap-8 py-6'>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-1 mb-1'>
                  <span className='material-symbols-outlined text-[#c0c1ff] text-xl'>
                    star
                  </span>
                  <span className='text-2xl font-bold text-[#e5e2e1]'>
                    {organizerProfile.rating.toFixed(1)}
                  </span>
                </div>
                <p className='text-xs text-[#c7c4d8] uppercase tracking-widest'>
                  Rating
                </p>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-[#e5e2e1] mb-1'>
                  {organizerProfile.reviewCount}
                </div>
                <p className='text-xs text-[#c7c4d8] uppercase tracking-widest'>
                  Reviews
                </p>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-[#e5e2e1] mb-1'>
                  {organizerProfile.eventCount}
                </div>
                <p className='text-xs text-[#c7c4d8] uppercase tracking-widest'>
                  Events
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className='px-8 max-w-4xl mx-auto'>
          <div className='flex border-b border-white/10'>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                activeTab === 'events'
                  ? 'text-[#c0c1ff] border-b-2 border-[#c0c1ff]'
                  : 'text-[#c7c4d8] hover:text-[#e5e2e1]'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                activeTab === 'reviews'
                  ? 'text-[#c0c1ff] border-b-2 border-[#c0c1ff]'
                  : 'text-[#c7c4d8] hover:text-[#e5e2e1]'
              }`}
            >
              Reviews
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='px-8 py-8 max-w-4xl mx-auto'>
          {activeTab === 'events' && (
            <div className='space-y-4'>
              {organizerProfile.events.length > 0 ? (
                organizerProfile.events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className='block bg-[#1c1b1b] p-5 rounded-lg border border-white/5 hover:border-[#c0c1ff]/30 transition-all'
                  >
                    <div className='flex justify-between items-start'>
                      <div>
                        <h3 className='font-bold text-[#e5e2e1] mb-2'>
                          {event.name}
                        </h3>
                        <p className='text-sm text-[#c7c4d8] mb-1'>
                          {formatDate(event.startDate)} • {event.location}
                        </p>
                        <div className='flex items-center gap-1 mt-2'>
                          <span className='material-symbols-outlined text-sm text-[#c0c1ff]'>
                            star
                          </span>
                          <span className='text-sm text-[#c7c4d8]'>
                            {event.rating ? event.rating.toFixed(1) : 'N/A'} ({event.reviewCount ?? 0} reviews)
                          </span>
                        </div>
                      </div>
                      <span className='material-symbols-outlined text-[#c7c4d8]'>
                        chevron_right
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className='text-center py-12 text-[#c7c4d8]'>
                  <span className='material-symbols-outlined text-4xl mb-3'>
                    event
                  </span>
                  <p>No events yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className='space-y-4'>
              {organizerProfile.reviews.length > 0 ? (
                organizerProfile.reviews.map((review) => (
                  <div
                    key={review.id}
                    className='bg-[#1c1b1b] p-5 rounded-lg border border-white/5'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center overflow-hidden'>
                          {review.userImage ? (
                            <img
                              src={review.userImage}
                              alt={review.userName}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <span className='material-symbols-outlined text-[#c7c4d8]'>
                              person
                            </span>
                          )}
                        </div>
                        <div>
                          <p className='font-medium text-[#e5e2e1]'>
                            {review.userName}
                          </p>
                          <p className='text-xs text-[#c7c4d8]'>
                            {review.eventName}
                          </p>
                        </div>
                      </div>
                      <div className='flex gap-0.5'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`material-symbols-outlined text-sm ${
                              star <= review.rating ? 'text-[#c0c1ff]' : 'text-[#353534]'
                            }`}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className='text-sm text-[#c7c4d8] leading-relaxed'>
                      {review.comment}
                    </p>
                    <p className='text-xs text-[#666] mt-3'>
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className='text-center py-12 text-[#c7c4d8]'>
                  <span className='material-symbols-outlined text-4xl mb-3'>
                    rate_review
                  </span>
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className='w-full py-12 px-8 bg-[#0E0E0E] border-t border-white/5'>
        <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6'>
          <p className='text-xs uppercase tracking-widest text-[#C7C4D8]'>
            © 2024 Kinetix Event Architecture.
          </p>
          <div className='flex gap-8'>
            <a
              className='text-xs uppercase tracking-widest text-[#C7C4D8] hover:text-[#C0C1FF]'
              href='#'
            >
              Privacy
            </a>
            <a
              className='text-xs uppercase tracking-widest text-[#C7C4D8] hover:text-[#C0C1FF]'
              href='#'
            >
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OrganizerProfilePage;