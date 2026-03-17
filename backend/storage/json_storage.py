import json
import os
from typing import List, Dict, Any, Optional
from pathlib import Path


class JSONStorage:
    """Generic JSON file storage for CRUD operations."""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
    
    def _get_file_path(self, filename: str) -> Path:
        """Get the full path for a data file."""
        return self.data_dir / filename
    
    def _ensure_file_exists(self, filename: str) -> None:
        """Create file with empty array if it doesn't exist."""
        file_path = self._get_file_path(filename)
        if not file_path.exists():
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump([], f)
    
    def read_all(self, filename: str) -> List[Dict[str, Any]]:
        """Read all records from a JSON file."""
        self._ensure_file_exists(filename)
        file_path = self._get_file_path(filename)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def write_all(self, filename: str, data: List[Dict[str, Any]]) -> None:
        """Write all records to a JSON file."""
        file_path = self._get_file_path(filename)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def create(self, filename: str, record: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new record to the file."""
        data = self.read_all(filename)
        data.append(record)
        self.write_all(filename, data)
        return record
    
    def read_by_id(self, filename: str, record_id: str, id_field: str = "id") -> Optional[Dict[str, Any]]:
        """Get a single record by ID."""
        data = self.read_all(filename)
        for record in data:
            if record.get(id_field) == record_id:
                return record
        return None
    
    def update(self, filename: str, record_id: str, updated_record: Dict[str, Any], id_field: str = "id") -> Optional[Dict[str, Any]]:
        """Update an existing record."""
        data = self.read_all(filename)
        
        for i, record in enumerate(data):
            if record.get(id_field) == record_id:
                data[i] = updated_record
                self.write_all(filename, data)
                return updated_record
        
        return None
    
    def delete(self, filename: str, record_id: str, id_field: str = "id") -> bool:
        """Delete a record by ID."""
        data = self.read_all(filename)
        original_length = len(data)
        
        data = [record for record in data if record.get(id_field) != record_id]
        
        if len(data) < original_length:
            self.write_all(filename, data)
            return True
        
        return False
