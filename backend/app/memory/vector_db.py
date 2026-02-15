class VectorDBClient:
    def __init__(self):
        pass

    async def search(self, embedding: List[float], top_k: int = 5):
        pass

    async def stored(self, embedding: List[float], metadata: Dict):
        pass
