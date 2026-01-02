
/**
   * We use .peek() here because we need the current logs to update them,
   * but we don't want this effect to RE-RUN every time 'logs' changes.
   * (Writing to a signal you are subscribed to causes recursion).
   */
  const currentLogs = logs.peek();
  
  const newLog = `Count is now: ${currentCount}`;
  logs([...currentLogs, newLog].slice(-5)); 
});

declare interface CounterType {
	static view: {	};
}
