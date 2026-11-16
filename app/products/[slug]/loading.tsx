export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-gray-200 aspect-square rounded-xl"></div>
        <div className="flex flex-col justify-center">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-24 bg-gray-200 rounded w-full mb-8"></div>
          <div className="h-14 bg-gray-200 rounded w-full md:w-48"></div>
        </div>
      </div>
    </div>
  )
}