import { useState, useEffect, useCallback, useMemo } from 'react';
import { supportRepository } from '../../data/support';

export function useSupportStore() {
  const [faqs, setFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportOrder, setReportOrder] = useState(null);

  // Manual refresh helpers
  const fetchFaqs = useCallback(async (category = activeCategory) => {
    setIsLoadingFaqs(true);
    try {
      const data = await supportRepository.getFaqs(category);
      setFaqs(data);
    } catch (err) {
      console.error('[SupportStore] Failed to load FAQs:', err);
    } finally {
      setIsLoadingFaqs(false);
    }
  }, [activeCategory]);

  const fetchTickets = useCallback(async () => {
    setIsLoadingTickets(true);
    try {
      const list = await supportRepository.getTickets();
      setTickets(list);
    } catch (err) {
      console.error('[SupportStore] Failed to load tickets:', err);
    } finally {
      setIsLoadingTickets(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    supportRepository
      .getFaqs(activeCategory)
      .then((data) => {
        if (isMounted) {
          setFaqs(data);
          setIsLoadingFaqs(false);
        }
      })
      .catch((err) => {
        console.error('[SupportStore] Failed to load FAQs:', err);
        if (isMounted) setIsLoadingFaqs(false);
      });

    supportRepository
      .getTickets()
      .then((list) => {
        if (isMounted) {
          setTickets(list);
          setIsLoadingTickets(false);
        }
      })
      .catch((err) => {
        console.error('[SupportStore] Failed to load tickets:', err);
        if (isMounted) setIsLoadingTickets(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  // Filtered FAQs based on category & search term
  const filteredFaqs = useMemo(() => {
    let result = faqs;
    if (activeCategory !== 'All') {
      result = result.filter(
        (f) => f.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(query) ||
          f.answer.toLowerCase().includes(query) ||
          f.category.toLowerCase().includes(query)
      );
    }
    return result;
  }, [faqs, activeCategory, searchQuery]);

  // Categories list extracted from FAQs
  const categories = useMemo(() => {
    const set = new Set(faqs.map((f) => f.category));
    return ['All', ...Array.from(set)];
  }, [faqs]);

  // Submit a new ticket
  const submitTicket = useCallback(
    async (ticketData) => {
      setIsSubmittingTicket(true);
      try {
        const created = await supportRepository.createTicket(ticketData);
        if (created) {
          setTickets((prev) => [created, ...prev.filter((t) => t.ticketNumber !== created.ticketNumber)]);
        }
        return created;
      } catch (err) {
        console.error('[SupportStore] Error submitting ticket:', err);
        throw err;
      } finally {
        setIsSubmittingTicket(false);
      }
    },
    []
  );

  const openReportModal = useCallback((order = null) => {
    setReportOrder(order);
    setIsReportModalOpen(true);
  }, []);

  const closeReportModal = useCallback(() => {
    setIsReportModalOpen(false);
    setReportOrder(null);
  }, []);

  return {
    faqs,
    filteredFaqs,
    categories,
    tickets,
    isLoadingFaqs,
    isLoadingTickets,
    isSubmittingTicket,
    activeCategory,
    searchQuery,
    selectedTicket,
    isReportModalOpen,
    reportOrder,
    setActiveCategory,
    setSearchQuery,
    setSelectedTicket,
    openReportModal,
    closeReportModal,
    submitTicket,
    refreshTickets: fetchTickets,
    refreshFaqs: fetchFaqs,
  };
}
