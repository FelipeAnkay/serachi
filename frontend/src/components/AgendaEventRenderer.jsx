export default function AgendaEventRenderer({ event }) {
  const id = event?.resource?._id || event.title;

  return (
    <div data-id={`event-${id}`}>
      {event.title}
    </div>
  );
}