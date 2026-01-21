'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ShippingValueInput() {
  const router = useRouter()
  const [shippingValue, setShippingValue] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Այստեղ կարող եք պահպանել տվյալները state management-ում կամ localStorage-ում
    console.log({ shippingValue, origin, destination })
    
    // Անցնել հաջորդ էջին
    router.push('/quotes/new/insurance')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Shipping Value Input</h1>
      <p className="text-gray-600 mb-8">Enter the details of your shipment to get an insurance quote</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Value ($)
          </label>
          <input
            type="number"
            value={shippingValue}
            onChange={(e) => setShippingValue(e.target.value)}
            placeholder="Enter the value of your shipment"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Origin
          </label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Where is the shipment coming from?"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where is the shipment going?"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Get Insurance Quote
          </button>
        </div>
      </form>
    </div>
  )
}