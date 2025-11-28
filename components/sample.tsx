"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { useVotingContract } from "@/hooks/useContract"

const SampleIntegration = () => {
  const { isConnected } = useAccount()
  const { data, actions, state } = useVotingContract()

  const [selectedCandidate, setSelectedCandidate] = useState("")

  const handleVote = async () => {
    if (!selectedCandidate) return
    await actions.castVote(selectedCandidate)
    setSelectedCandidate("")
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p>Please connect your wallet to vote.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Voting DApp</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Candidates</h2>
        <div className="space-y-2">
          {data.candidates.map((c, i) => (
            <div
              key={i}
              className={`p-3 border rounded-lg cursor-pointer ${selectedCandidate === c.name ? "bg-primary text-primary-foreground" : "bg-card"}`}
              onClick={() => setSelectedCandidate(c.name)}
            >
              <div className="font-bold">{c.name}</div>
              <div className="text-sm opacity-70">{c.votes} votes</div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleVote}
        disabled={state.isLoading || data.hasVoted || !selectedCandidate}
        className="w-full py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
      >
        {state.isLoading ? "Voting..." : data.hasVoted ? "Already Voted" : "Cast Vote"}
      </button>

      {state.hash && (
        <div className="mt-4 p-3 border rounded bg-card">
          <p className="text-xs opacity-70">Transaction:</p>
          <p className="break-all font-mono">{state.hash}</p>
        </div>
      )}

      {state.error && (
        <div className="mt-4 p-3 border rounded text-destructive">
          Error: {state.error.message}
        </div>
      )}
    </div>
  )
}

export default SampleIntegration;
