export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  location: string;
}

export default function TimelineComponent({
  items,
}: {
  items: TimelineItem[];
}) {
  return (
    <ol className="relative space-y-8 before:absolute before:-ml-px before:h-full before:w-0.5 before:rounded-full before:bg-gray-200">
      {items.map((item) => (
        <li className="relative -ms-1.5 flex items-start gap-4">
          <span className="size-3 shrink-0 rounded-full bg-blue-600"></span>

          <div className="-mt-2">
            <time className="text-xs/none font-medium text-gray-700">
              {item.date}
            </time>

            <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>

            <p className="mt-0.5 text-sm text-gray-700 pr-10">
              {item.description}
            </p>
            <div className="text-left">
              <span className="text-xs text-muted-foreground pr-5">📍</span>
              <span className="text-muted-foreground text-sm">
                {item.location}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
