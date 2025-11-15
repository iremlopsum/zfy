import userStore from './stores/user-store'

const updateLikes = userStore.getState().update

const App = () => {
  const likes = userStore((data) => data.data.likes)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Likes: {likes}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This is a simple example of how to use Zfy to manage state in a
            React application.
          </p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
            onClick={() => updateLikes((data) => (data.likes = data.likes + 1))}
          >
            Increment
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md mr-2"
            onClick={() => updateLikes((data) => (data.likes = data.likes - 1))}
          >
            Decrement
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
            onClick={() => updateLikes((data) => (data.likes = 0))}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
