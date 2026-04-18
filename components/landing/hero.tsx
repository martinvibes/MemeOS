'use client'

import { motion } from 'framer-motion'

const ASCII_LOGO = `███╗   ███╗███████╗███╗   ███╗███████╗ ██████╗ ███████╗
████╗ ████║██╔════╝████╗ ████║██╔════╝██╔═══██╗██╔════╝
██╔████╔██║█████╗  ██╔████╔██║█████╗  ██║   ██║███████╗
██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██╔══╝  ██║   ██║╚════██║
██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║███████╗╚██████╔╝███████║
╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚══════╝`

export function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="text-center"
    >
      <pre className="font-mono text-memeos-cyan text-[10px] sm:text-xs md:text-sm leading-tight select-none mb-6">
        {ASCII_LOGO}
      </pre>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <p className="font-mono text-memeos-text-dim text-sm tracking-[0.3em] uppercase mb-2">
          Autonomous Meme Coin Operating System
        </p>
        <p className="font-sans text-memeos-text-muted text-xs">
          One prompt. Full empire. Real on-chain deployment.
        </p>
      </motion.div>
    </motion.div>
  )
}
