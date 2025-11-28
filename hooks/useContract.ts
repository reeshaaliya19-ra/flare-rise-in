"use client"

import { useEffect, useState } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractABI, contractAddress } from "@/lib/contract"
import { readContract } from "@wagmi/core"
import { config } from "@/lib/wagmi"   // <-- ensure you export wagmi config

export interface Candidate {
  name: string
  votes: number
}

export const useVotingContract = () => {
  const { address } = useAccount()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { data: candidateCount } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getCandidateCount",
  })

  const { data: hasVoted } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "hasVoted",
    args: [address],
    query: { enabled: !!address }
  })

  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    const loadCandidates = async () => {
      if (!candidateCount) return
      const count = Number(candidateCount)

      const result: Candidate[] = []

      for (let i = 0; i < count; i++) {
        const name = await readContract(config, {
          address: contractAddress,
          abi: contractABI,
          functionName: "candidateList",
          args: [BigInt(i)]
        })

        const voteCount = await readContract(config, {
          address: contractAddress,
          abi: contractABI,
          functionName: "votes",
          args: [name]
        })

        result.push({
          name,
          votes: Number(voteCount),
        })
      }

      setCandidates(result)
    }

    loadCandidates()
  }, [candidateCount, isConfirmed])

  const castVote = async (candidate: string) => {
    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "vote",
        args: [candidate]
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    data: {
      candidates,
      hasVoted: Boolean(hasVoted),
    },
    actions: {
      castVote,
    },
    state: {
      isLoading: isLoading || isPending || isConfirming,
      isPending,
      isConfirming,
      isConfirmed,
      hash,
      error,
    }
  }
}
